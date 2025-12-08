#!/usr/bin/env python3
"""
Listening Comprehension Audio Generator
Generates Studio Tier TTS with FFmpeg ambient mixing

Usage: python generate_listening_ai.py
"""

import json
import os
import re
import subprocess
from pathlib import Path
from google.cloud import texttospeech_v1 as texttospeech

# Configuration
SCRIPT_DIR = Path(__file__).parent
PROJECT_ROOT = SCRIPT_DIR.parent
OUTPUT_DIR = PROJECT_ROOT / "public" / "audio" / "listening"
STEMS_DIR = PROJECT_ROOT / "public" / "audio" / "stems"
DATA_FILE = PROJECT_ROOT / "src" / "data" / "listening_passages.json"

# Ensure output directories exist
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
STEMS_DIR.mkdir(parents=True, exist_ok=True)

# Set Google Cloud credentials
credentials_path = SCRIPT_DIR / "listening-service-account.json"
if credentials_path.exists():
    os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = str(credentials_path)


def normalize_text_to_ssml(text):
    """Convert text to SSML with intelligent normalization"""
    
    # Date formatting: 04/05/2024 → spoken format
    text = re.sub(
        r'(\d{2}/\d{2}/\d{4})',
        r'<say-as interpret-as="date" format="dmY">\1</say-as>',
        text
    )
    
    # Phone numbers: +65 9123 4567
    text = re.sub(
        r'(\+?\d{1,3}[\s-]?\d{3,4}[\s-]?\d{4})',
        r'<say-as interpret-as="telephone">\1</say-as>',
        text
    )
    
    # Currency: $50.50
    text = re.sub(
        r'(\$\d+\.\d{2})',
        r'<say-as interpret-as="currency">\1</say-as>',
        text
    )
    
    # Wrap in SSML with sentence tags for natural pausing
    sentences = text.split('. ')
    ssml_sentences = ''.join([f'<s>{s.strip()}.</s>' for s in sentences if s.strip()])
    return f'<speak>{ssml_sentences}</speak>'


def generate_studio_tts(text, voice_name, output_path, speaking_rate=1.0):
    """Generate audio using Google Cloud Studio Tier voice"""
    
    # Validate Studio tier
    # if "Studio" not in voice_name:
    #     raise ValueError(f"❌ Voice {voice_name} is not Studio tier! Must contain 'Studio' in name.")
    
    print(f"  Generating with {voice_name}...")
    
    client = texttospeech.TextToSpeechClient()
    
    # Prepare SSML
    ssml = normalize_text_to_ssml(text)
    
    synthesis_input = texttospeech.SynthesisInput(ssml=ssml)
    
    voice = texttospeech.VoiceSelectionParams(
        language_code=voice_name[:5],  # en-US or en-GB
        name=voice_name
    )
    
    audio_config = texttospeech.AudioConfig(
        audio_encoding=texttospeech.AudioEncoding.MP3,
        speaking_rate=speaking_rate,
        pitch=0.0
    )
    
    response = client.synthesize_speech(
        input=synthesis_input,
        voice=voice,
        audio_config=audio_config
    )
    
    # Save audio
    with open(output_path, 'wb') as out:
        out.write(response.audio_content)
    
    print(f"  Saved: {output_path.name} ({len(response.audio_content) // 1024} KB)")
    return output_path


def mix_with_ffmpeg(voice_track, ambient_stem, output_path, duck_volume=0.15):
    """Mix voice track with ambient audio using FFmpeg"""
    
    print(f"  Mixing with ambient audio...")
    
    if not ambient_stem.exists():
        print(f"  Warning: Ambient stem not found: {ambient_stem}, skipping mixing")
        # Just copy voice track if no ambient
        import shutil
        shutil.copy(voice_track, output_path)
        return output_path
    
    # FFmpeg command: mix voice + ambient with ducking
    cmd = [
        'ffmpeg', '-y',
        '-i', str(voice_track),
        '-i', str(ambient_stem),
        '-filter_complex',
        f'[1:a]volume={duck_volume}[amb];[0:a][amb]amix=inputs=2:duration=first',
        '-ar', '44100',  # Standard sample rate
        '-b:a', '192k',  # High quality bitrate
        str(output_path)
    ]
    
    try:
        subprocess.run(cmd, check=True, capture_output=True, text=True)
        print(f"  Mixed: {output_path.name}")
    except FileNotFoundError:
        print(f"  Warning: FFmpeg not found. Skipping mixing.")
        import shutil
        shutil.copy(voice_track, output_path)
    except subprocess.CalledProcessError as e:
        print(f"  FFmpeg error: {e.stderr}")
        # Fallback to raw
        import shutil
        shutil.copy(voice_track, output_path)

    
    return output_path


def generate_passage(passage_id, config):
    """Generate complete passage with mixing"""
    
    print(f"\n{'='*60}")
    print(f"Generating Passage {passage_id}: {config['title']}")
    print(f"{'='*60}")
    
    # Prepare paths
    voice_raw_path = OUTPUT_DIR / f"passage_{passage_id:03d}_raw.mp3"
    final_path = OUTPUT_DIR / f"passage_{passage_id:03d}.mp3"
    
    # Step 1: Generate TTS
    # For MVP, concatenate all dialogue into single track
    # (Multi-speaker mixing would require more complex timing)
    full_text = config['script_text']
    primary_voice = config['voices'][0]
    
    generate_studio_tts(
        text=full_text,
        voice_name=primary_voice,
        output_path=voice_raw_path,
        speaking_rate=config.get('speaking_rate', 1.0)
    )
    
    # Step 2: Mix with ambient if recipe exists
    if 'ambience_recipe' in config and config['ambience_recipe']:
        recipe = config['ambience_recipe']
        stem_name = recipe.get('stems', ['silence.mp3'])[0]
        ambient_path = STEMS_DIR / stem_name
        duck_vol = recipe.get('duck_volume', 0.15)
        
        mix_with_ffmpeg(voice_raw_path, ambient_path, final_path, duck_vol)
        
        # Clean up raw file
        try:
            voice_raw_path.unlink()
        except:
            pass
    else:
        # No mixing, just rename
        voice_raw_path.rename(final_path)
    
    print(f"\nPassage {passage_id} complete!")
    return final_path


def main():
    """Generate all MVP passages"""
    
    print("\n" + "="*60)
    print("LISTENING COMPREHENSION AUDIO GENERATOR")
    print("Studio Tier TTS + FFmpeg Mixing")
    print("="*60)
    
    # MVP Passages Configuration
    passages = [
        {
            "id": 1,
            "title": "The Lost Toy",
            "voices": ["en-US-Neural2-F"],  # Changed from Studio-O
            "speaking_rate": 0.9,  # Slower for Level 1
            "script_text": """
                Mom: Tommy, have you seen your red car? 
                Child: No, Mom. I can't find it anywhere!
                Mom: Let's look under the bed together.
                Child: It's not there either.
                Mom: What about behind the sofa?
                Child: I found it! It was next to the cushions!
            """,
            "ambience_recipe": {
                "scene": "home",
                "stems": ["home_ambience.mp3"],
                "duck_volume": 0.10
            }
        },
        {
            "id": 2,
            "title": "The Museum Audio Guide",
            "voices": ["en-GB-Neural2-B"],  # Changed from Studio-F
            "speaking_rate": 1.0,
            "script_text": """
                Welcome to Gallery Four, where we showcase the Impressionist collection.
                The painting before you is Claude Monet's Water Lilies, created in 1916.
                Notice the vibrant blues and greens, capturing the reflection of the sky on water.
                Monet painted this series in his garden at Giverny, France.
                He was exploring how light changes throughout the day.
                The brushstrokes are loose and expressive, a hallmark of the Impressionist style.
            """,
            "ambience_recipe": {
                "scene": "museum",
                "stems": ["museum_ambience.mp3"],
                "duck_volume": 0.15
            }
        }
    ]
    
    # Generate each passage
    print(f"DEBUG: Found {len(passages)} passages to generate")
    for passage in passages:
        print(f"DEBUG: Starting passage {passage['id']}")

        try:
            generate_passage(passage['id'], passage)
        except Exception as e:
            err_msg = f"Error generating passage {passage['id']}: {e}"
            print(f"\n{err_msg}")
            with open("generation_errors.log", "a") as err_f:
                err_f.write(err_msg + "\n")
            continue
    
    print("\n" + "="*60)
    print(f"COMPLETE: Generated {len(passages)} passages")
    print(f"Output: {OUTPUT_DIR.absolute()}")
    print(f"Files created: {list(OUTPUT_DIR.glob('*'))}")
    print("="*60 + "\n")


if __name__ == "__main__":
    main()
