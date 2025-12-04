import json
import random
import os

# ---------------------------------------------------------
# Part 1: Data Loading
# ---------------------------------------------------------

def load_original_questions(filepath):
    # We might not even need the original questions if we are regenerating everything
    # But let's keep it for now if we want to merge
    if os.path.exists(filepath):
        with open(filepath, 'r') as f:
            return json.load(f)
    return []

# ---------------------------------------------------------
# Part 2: Generator Logic
# ---------------------------------------------------------

# Vocabulary Bank: List of Dictionaries
# Fields: word, difficulty, theme, distractors, definition, example
vocab_bank = [
    # Difficulty 1
    {
        "word": "happy",
        "difficulty": 1,
        "theme": "Emotions",
        "distractors": ["sad", "angry", "bored"],
        "definition": "Feeling or showing pleasure or contentment.",
        "example": "She felt _____ when she received the gift."
    },
    {
        "word": "loud",
        "difficulty": 1,
        "theme": "Description",
        "distractors": ["quiet", "soft", "silent"],
        "definition": "Producing much noise; easily audible.",
        "example": "The music was so _____ that it hurt my ears."
    },
    {
        "word": "honest",
        "difficulty": 1,
        "theme": "Personality",
        "distractors": ["lying", "deceitful", "false"],
        "definition": "Free of deceit and untruthfulness; sincere.",
        "example": "He is an _____ man who always tells the truth."
    },
    {
        "word": "beautiful",
        "difficulty": 1,
        "theme": "Description",
        "distractors": ["ugly", "plain", "dirty"],
        "definition": "Pleasing the senses or mind aesthetically.",
        "example": "The sunset over the ocean was _____."
    },
    
    # Difficulty 2
    {
        "word": "nervous",
        "difficulty": 2,
        "theme": "Emotions",
        "distractors": ["calm", "brave", "sleepy"],
        "definition": "Easily agitated or alarmed; tending to be anxious.",
        "example": "I always get _____ before a big test."
    },
    {
        "word": "confusing",
        "difficulty": 2,
        "theme": "Description",
        "distractors": ["clear", "easy", "simple"],
        "definition": "Bewildering or perplexing.",
        "example": "The instructions were _____ and hard to follow."
    },
    {
        "word": "foolish",
        "difficulty": 2,
        "theme": "Behavior",
        "distractors": ["wise", "smart", "clever"],
        "definition": "Lacking good sense or judgment; unwise.",
        "example": "It was _____ to leave the door unlocked."
    },
    {
        "word": "violent",
        "difficulty": 2,
        "theme": "Nature",
        "distractors": ["gentle", "calm", "weak"],
        "definition": "Using or involving physical force intended to hurt or damage.",
        "example": "The _____ storm destroyed many trees."
    },
    {
        "word": "rude",
        "difficulty": 2,
        "theme": "Behavior",
        "distractors": ["polite", "kind", "nice"],
        "definition": "Offensively impolite or ill-mannered.",
        "example": "It is _____ to interrupt someone when they are speaking."
    },
    {
        "word": "important",
        "difficulty": 2,
        "theme": "Description",
        "distractors": ["useless", "tiny", "weak"],
        "definition": "Of great significance or value.",
        "example": "It is _____ to drink water every day."
    },
    {
        "word": "brave",
        "difficulty": 2,
        "theme": "Behavior",
        "distractors": ["scared", "shy", "weak"],
        "definition": "Ready to face and endure danger or pain; showing courage.",
        "example": "The _____ firefighter saved the cat from the tree."
    },
    {
        "word": "scary",
        "difficulty": 2,
        "theme": "Description",
        "distractors": ["funny", "nice", "kind"],
        "definition": "Frightening; causing fear.",
        "example": "The movie was too _____ for the children."
    },
    {
        "word": "bright",
        "difficulty": 2,
        "theme": "Description",
        "distractors": ["dull", "dark", "dim"],
        "definition": "Giving out or reflecting a lot of light; shining.",
        "example": "The sun was so _____ that I needed sunglasses."
    },
    {
        "word": "strict",
        "difficulty": 2,
        "theme": "Personality",
        "distractors": ["easy", "kind", "soft"],
        "definition": "Demanding that rules concerning behavior are obeyed.",
        "example": "Our teacher is _____ about homework deadlines."
    },
    {
        "word": "quiet",
        "difficulty": 2,
        "theme": "Description",
        "distractors": ["loud", "noisy", "busy"],
        "definition": "Making little or no noise.",
        "example": "Please be _____ in the library."
    },

    # Difficulty 3
    {
        "word": "seized",
        "difficulty": 3,
        "theme": "Action",
        "distractors": ["lost", "dropped", "gave"],
        "definition": "Take hold of suddenly and forcibly.",
        "example": "He _____ the opportunity to travel abroad."
    },
    {
        "word": "devised",
        "difficulty": 3,
        "theme": "Action",
        "distractors": ["ruined", "broke", "stopped"],
        "definition": "Plan or invent by careful thought.",
        "example": "The team _____ a new strategy to win the game."
    },
    {
        "word": "suppressed",
        "difficulty": 3,
        "theme": "Action",
        "distractors": ["showed", "helped", "pushed"],
        "definition": "Forcibly put an end to.",
        "example": "She _____ her anger before speaking."
    },
    {
        "word": "supported",
        "difficulty": 3,
        "theme": "Action",
        "distractors": ["broke", "hurt", "stopped"],
        "definition": "Bear all or part of the weight of; hold up.",
        "example": "The evidence _____ the suspect's alibi."
    },
    {
        "word": "follow",
        "difficulty": 3,
        "theme": "Action",
        "distractors": ["lead", "break", "stop"],
        "definition": "Act according to (an instruction or precept).",
        "example": "We must _____ the rules if we want to succeed."
    },
    {
        "word": "amazed",
        "difficulty": 3,
        "theme": "Emotions",
        "distractors": ["bored", "tired", "used"],
        "definition": "Greatly surprised; astonished.",
        "example": "I was _____ by the sheer size of the monument."
    },
    {
        "word": "detailed",
        "difficulty": 3,
        "theme": "Description",
        "distractors": ["vague", "short", "brief"],
        "definition": "Having many details or facts; showing attention to detail.",
        "example": "The _____ explanation clarified all our doubts."
    },
    {
        "word": "excellent",
        "difficulty": 3,
        "theme": "Ability",
        "distractors": ["bad", "poor", "weak"],
        "definition": "Extremely good; outstanding.",
        "example": "He has an _____ memory for names and faces."
    },
    {
        "word": "strange",
        "difficulty": 3,
        "theme": "Description",
        "distractors": ["normal", "usual", "common"],
        "definition": "Unusual or surprising in a way that is unsettling or hard to understand.",
        "example": "The soup had a _____ taste that I couldn't identify."
    },
    {
        "word": "crucial",
        "difficulty": 3,
        "theme": "Importance",
        "distractors": ["minor", "small", "low"],
        "definition": "Decisive or critical, especially in the success or failure of something.",
        "example": "It is _____ that you finish this work by tomorrow."
    },
    {
        "word": "curious",
        "difficulty": 3,
        "theme": "Personality",
        "distractors": ["bored", "dull", "shy"],
        "definition": "Eager to know or learn something.",
        "example": "The _____ student always asks insightful questions."
    },
    {
        "word": "fancy",
        "difficulty": 3,
        "theme": "Description",
        "distractors": ["plain", "simple", "ugly"],
        "definition": "Elaborate in structure or decoration.",
        "example": "She wore a _____ dress to the gala."
    },
    {
        "word": "inspiring",
        "difficulty": 3,
        "theme": "Description",
        "distractors": ["boring", "dull", "bad"],
        "definition": "Having the effect of inspiring someone.",
        "example": "The politician gave an _____ speech."
    },
    {
        "word": "open",
        "difficulty": 3,
        "theme": "Personality",
        "distractors": ["closed", "shy", "mean"],
        "definition": "Ready to entertain new ideas; not closed or blocking.",
        "example": "He is _____ to new ideas."
    },
    {
        "word": "winding",
        "difficulty": 3,
        "theme": "Nature",
        "distractors": ["straight", "short", "flat"],
        "definition": "Following a twisting or spiral course.",
        "example": "The _____ path led us deep into the forest."
    },
    {
        "word": "disappointed",
        "difficulty": 3,
        "theme": "Emotions",
        "distractors": ["happy", "glad", "proud"],
        "definition": "Sad or displeased because someone or something has failed to fulfill one's hopes or expectations.",
        "example": "She felt _____ when the project failed."
    },
    {
        "word": "rare",
        "difficulty": 3,
        "theme": "Description",
        "distractors": ["common", "usual", "many"],
        "definition": "Not occurring very often.",
        "example": "The _____ antique vase was worth a fortune."
    },
    {
        "word": "kind",
        "difficulty": 3,
        "theme": "Personality",
        "distractors": ["mean", "cruel", "bad"],
        "definition": "Having or showing a friendly, generous, and considerate nature.",
        "example": "His _____ nature makes him a great leader."
    },
    {
        "word": "simple",
        "difficulty": 3,
        "theme": "Description",
        "distractors": ["hard", "complex", "tough"],
        "definition": "Easily understood or done; presenting no difficulty.",
        "example": "The problem seemed _____ at first glance."
    },
    {
        "word": "jealous",
        "difficulty": 3,
        "theme": "Emotions",
        "distractors": ["happy", "proud", "glad"],
        "definition": "Feeling or showing envy of someone or their achievements and advantages.",
        "example": "She is _____ of her brother's success."
    },
    {
        "word": "fierce",
        "difficulty": 3,
        "theme": "Description",
        "distractors": ["gentle", "kind", "soft"],
        "definition": "Having or displaying an intense or ferocious aggressiveness.",
        "example": "The _____ dog barked at the stranger."
    },
    {
        "word": "sincere",
        "difficulty": 3,
        "theme": "Social Interaction",
        "distractors": ["fake", "lying", "bad"],
        "definition": "Free from pretense or deceit; proceeding from genuine feelings.",
        "example": "He made a _____ apology for his mistake."
    },
    {
        "word": "vibrant",
        "difficulty": 3,
        "theme": "Nature",
        "distractors": ["dull", "dark", "pale"],
        "definition": "Full of energy and enthusiasm; bright and striking.",
        "example": "The _____ colours of the sunset were breathtaking."
    },
    {
        "word": "mutual",
        "difficulty": 3,
        "theme": "Social Interaction",
        "distractors": ["single", "one", "lone"],
        "definition": "Held in common by two or more parties.",
        "example": "They reached a _____ agreement."
    },
    {
        "word": "heavy",
        "difficulty": 3,
        "theme": "Description",
        "distractors": ["light", "easy", "soft"],
        "definition": "Of great weight; difficult to lift or move.",
        "example": "The _____ traffic delayed our arrival."
    },
    {
        "word": "calm",
        "difficulty": 3,
        "theme": "Emotions",
        "distractors": ["angry", "mad", "wild"],
        "definition": "Not showing or feeling nervousness, anger, or other emotions.",
        "example": "He remained _____ despite the chaos."
    },
    {
        "word": "effective",
        "difficulty": 3,
        "theme": "Description",
        "distractors": ["bad", "slow", "weak"],
        "definition": "Successful in producing a desired or intended result.",
        "example": "The _____ solution solved the issue immediately."
    },
    {
        "word": "careful",
        "difficulty": 3,
        "theme": "Personality",
        "distractors": ["wild", "fast", "rash"],
        "definition": "Making sure of avoiding potential danger, mishap, or harm.",
        "example": "He is _____ about his health."
    },
    {
        "word": "strong",
        "difficulty": 3,
        "theme": "Nature",
        "distractors": ["weak", "soft", "low"],
        "definition": "Having the power to move heavy weights or perform other physically demanding tasks.",
        "example": "The _____ wind blew the leaves away."
    },
    {
        "word": "natural",
        "difficulty": 3,
        "theme": "Ability",
        "distractors": ["fake", "learned", "forced"],
        "definition": "Existing in or caused by nature; not made or caused by humankind.",
        "example": "She has a _____ talent for painting."
    },
    {
        "word": "fascinating",
        "difficulty": 3,
        "theme": "Description",
        "distractors": ["boring", "dull", "slow"],
        "definition": "Extremely interesting.",
        "example": "The _____ book kept me up all night."
    },
    {
        "word": "hateful",
        "difficulty": 3,
        "theme": "Social Interaction",
        "distractors": ["loving", "kind", "nice"],
        "definition": "Arousing, deserving, or filled with hatred.",
        "example": "His _____ comments were not appreciated."
    },
    {
        "word": "tall",
        "difficulty": 3,
        "theme": "Description",
        "distractors": ["short", "low", "tiny"],
        "definition": "Of great or more than average height.",
        "example": "The _____ building towered over the city."
    },
    {
        "word": "delighted",
        "difficulty": 3,
        "theme": "Emotions",
        "distractors": ["sad", "mad", "hurt"],
        "definition": "Feeling or showing great pleasure.",
        "example": "She was _____ to see her old friend."
    },
    {
        "word": "fresh",
        "difficulty": 3,
        "theme": "Nature",
        "distractors": ["stale", "old", "rotten"],
        "definition": "Not previously known or used; new or different.",
        "example": "The _____ water was crystal clear."
    },

    # Difficulty 4-6
    {
        "word": "elated",
        "difficulty": 4,
        "theme": "Emotions",
        "distractors": ["depressed", "miserable", "sorrowful"],
        "definition": "Ecstatically happy.",
        "example": "He was _____ after winning the championship."
    },
    {
        "word": "deafening",
        "difficulty": 4,
        "theme": "Description",
        "distractors": ["muffled", "faint", "audible"],
        "definition": "So loud as to make it impossible to hear anything else.",
        "example": "The explosion caused a _____ noise."
    },
    {
        "word": "scrupulous",
        "difficulty": 6,
        "theme": "Personality",
        "distractors": ["careless", "dishonest", "slack"],
        "definition": "Diligent, thorough, and extremely attentive to details.",
        "example": "He is a _____ researcher who checks every fact."
    },
    {
        "word": "spectacular",
        "difficulty": 4,
        "theme": "Description",
        "distractors": ["ordinary", "mundane", "average"],
        "definition": "Beautiful in a dramatic and eye-catching way.",
        "example": "The fireworks display was _____."
    },
    {
        "word": "anxious",
        "difficulty": 4,
        "theme": "Emotions",
        "distractors": ["confident", "serene", "assured"],
        "definition": "Experiencing worry, unease, or nervousness.",
        "example": "She felt _____ about the interview."
    },
    {
        "word": "ambiguous",
        "difficulty": 5,
        "theme": "Description",
        "distractors": ["explicit", "clear", "definite"],
        "definition": "Open to more than one interpretation; having a double meaning.",
        "example": "The ending of the movie was _____."
    },
    {
        "word": "rash",
        "difficulty": 4,
        "theme": "Behavior",
        "distractors": ["cautious", "prudent", "careful"],
        "definition": "Displaying or proceeding from a lack of careful consideration of the possible consequences of an action.",
        "example": "It was a _____ decision to quit his job without another one lined up."
    },
    {
        "word": "destructive",
        "difficulty": 4,
        "theme": "Nature",
        "distractors": ["creative", "harmless", "benign"],
        "definition": "Causing great and irreparable harm or damage.",
        "example": "The hurricane was incredibly _____."
    },
    {
        "word": "erratic",
        "difficulty": 5,
        "theme": "Behavior",
        "distractors": ["consistent", "stable", "predictable"],
        "definition": "Not even or regular in pattern or movement; unpredictable.",
        "example": "His driving became _____ after he got tired."
    },
    {
        "word": "momentous",
        "difficulty": 5,
        "theme": "Description",
        "distractors": ["trivial", "insignificant", "minor"],
        "definition": "Of great importance or significance, especially in its bearing on the future.",
        "example": "It was a _____ occasion for the country."
    },
    {
        "word": "valiant",
        "difficulty": 5,
        "theme": "Behavior",
        "distractors": ["cowardly", "fearful", "timid"],
        "definition": "Possessing or showing courage or determination.",
        "example": "The soldiers made a _____ effort to hold the line."
    },
    {
        "word": "ominous",
        "difficulty": 5,
        "theme": "Description",
        "distractors": ["auspicious", "promising", "bright"],
        "definition": "Giving the impression that something bad or unpleasant is going to happen.",
        "example": "Dark clouds gathered in an _____ way."
    },
    {
        "word": "radiant",
        "difficulty": 4,
        "theme": "Description",
        "distractors": ["gloomy", "dim", "lackluster"],
        "definition": "Sending out light; shining or glowing brightly.",
        "example": "She looked _____ in her wedding dress."
    },
    {
        "word": "meticulous",
        "difficulty": 6,
        "theme": "Personality",
        "distractors": ["sloppy", "negligent", "careless"],
        "definition": "Showing great attention to detail; very careful and precise.",
        "example": "He was _____ about keeping his records organized."
    },
    {
        "word": "tranquil",
        "difficulty": 4,
        "theme": "Description",
        "distractors": ["chaotic", "turbulent", "noisy"],
        "definition": "Free from disturbance; calm.",
        "example": "The lake was _____ in the early morning."
    },
    {
        "word": "grasped",
        "difficulty": 4,
        "theme": "Action",
        "distractors": ["released", "misunderstood", "ignored"],
        "definition": "Seize and hold firmly.",
        "example": "He _____ the rope tightly."
    },
    {
        "word": "implemented",
        "difficulty": 5,
        "theme": "Action",
        "distractors": ["rejected", "cancelled", "delayed"],
        "definition": "Put (a decision, plan, agreement, etc.) into effect.",
        "example": "The school _____ a new dress code."
    },
    {
        "word": "stifled",
        "difficulty": 5,
        "theme": "Action",
        "distractors": ["encouraged", "expressed", "vented"],
        "definition": "Restrain (a reaction) or stop oneself acting on (an emotion).",
        "example": "She _____ a yawn during the meeting."
    },
    {
        "word": "corroborated",
        "difficulty": 6,
        "theme": "Action",
        "distractors": ["contradicted", "denied", "refuted"],
        "definition": "Confirm or give support to (a statement, theory, or finding).",
        "example": "The witness _____ the victim's account."
    },
    {
        "word": "adhere",
        "difficulty": 5,
        "theme": "Action",
        "distractors": ["violate", "ignore", "neglect"],
        "definition": "Stick fast to (a surface or substance).",
        "example": "The glue will _____ to almost any surface."
    },
    {
        "word": "awed",
        "difficulty": 4,
        "theme": "Emotions",
        "distractors": ["unimpressed", "indifferent", "bored"],
        "definition": "Filled with wonder.",
        "example": "We were _____ by the beauty of the mountains."
    },
    {
        "word": "coherent",
        "difficulty": 5,
        "theme": "Description",
        "distractors": ["muddled", "illogical", "confused"],
        "definition": "(of an argument, theory, or policy) logical and consistent.",
        "example": "He gave a _____ explanation of the complex theory."
    },
    {
        "word": "retentive",
        "difficulty": 6,
        "theme": "Ability",
        "distractors": ["forgetful", "leaky", "porous"],
        "definition": "Having the ability to remember facts and impressions easily.",
        "example": "She has a remarkably _____ memory."
    },
    {
        "word": "peculiar",
        "difficulty": 4,
        "theme": "Description",
        "distractors": ["typical", "standard", "normal"],
        "definition": "Strange or odd; unusual.",
        "example": "It was a _____ situation to be in."
    },
    {
        "word": "imperative",
        "difficulty": 5,
        "theme": "Importance",
        "distractors": ["optional", "unnecessary", "needless"],
        "definition": "Of vital importance; crucial.",
        "example": "It is _____ that we leave immediately."
    },
    {
        "word": "inquisitive",
        "difficulty": 5,
        "theme": "Personality",
        "distractors": ["disinterested", "apathetic", "detached"],
        "definition": "Curious or inquiring.",
        "example": "The _____ child asked many questions."
    },
    {
        "word": "elaborate",
        "difficulty": 5,
        "theme": "Description",
        "distractors": ["plain", "simple", "basic"],
        "definition": "Involving many carefully arranged parts or details; detailed and complicated in design and planning.",
        "example": "They made _____ plans for the party."
    },
    {
        "word": "eloquent",
        "difficulty": 5,
        "theme": "Description",
        "distractors": ["inarticulate", "mumbling", "stuttering"],
        "definition": "Fluent or persuasive in speaking or writing.",
        "example": "The speaker was very _____ and moving."
    },
    {
        "word": "receptive",
        "difficulty": 5,
        "theme": "Personality",
        "distractors": ["stubborn", "resistant", "closed"],
        "definition": "Willing to consider or accept new suggestions and ideas.",
        "example": "The audience was _____ to his message."
    },
    {
        "word": "meandering",
        "difficulty": 5,
        "theme": "Nature",
        "distractors": ["direct", "straight", "linear"],
        "definition": "Following a winding course.",
        "example": "We walked along the _____ river."
    },
    {
        "word": "despondent",
        "difficulty": 6,
        "theme": "Emotions",
        "distractors": ["hopeful", "cheerful", "optimistic"],
        "definition": "In low spirits from loss of hope or courage.",
        "example": "He became _____ after failing the exam."
    },
    {
        "word": "exquisite",
        "difficulty": 5,
        "theme": "Description",
        "distractors": ["flawed", "rough", "crude"],
        "definition": "Extremely beautiful and, typically, delicate.",
        "example": "The jewelry was of _____ craftsmanship."
    },
    {
        "word": "gregarious",
        "difficulty": 6,
        "theme": "Personality",
        "distractors": ["introverted", "shy", "antisocial"],
        "definition": "(of a person) fond of company; sociable.",
        "example": "He is a _____ person who loves parties."
    },
    {
        "word": "insurmountable",
        "difficulty": 6,
        "theme": "Description",
        "distractors": ["conquerable", "easy", "beatable"],
        "definition": "Too great to be overcome.",
        "example": "The obstacles seemed _____."
    },
    {
        "word": "envious",
        "difficulty": 4,
        "theme": "Emotions",
        "distractors": ["content", "satisfied", "generous"],
        "definition": "Feeling or showing envy.",
        "example": "She was _____ of her friend's new car."
    },
    {
        "word": "ferocious",
        "difficulty": 5,
        "theme": "Description",
        "distractors": ["tame", "gentle", "docile"],
        "definition": "Savagely fierce, cruel, or violent.",
        "example": "The lion gave a _____ roar."
    },
    {
        "word": "profuse",
        "difficulty": 6,
        "theme": "Social Interaction",
        "distractors": ["scant", "sparse", "meager"],
        "definition": "(especially of something offered or discharged) exuberantly plentiful; abundant.",
        "example": "He offered _____ apologies for being late."
    },
    {
        "word": "resplendent",
        "difficulty": 6,
        "theme": "Nature",
        "distractors": ["drab", "dull", "faded"],
        "definition": "Attractive and impressive through being richly colorful or sumptuous.",
        "example": "The queen looked _____ in her robes."
    },
    {
        "word": "unanimous",
        "difficulty": 5,
        "theme": "Social Interaction",
        "distractors": ["divided", "split", "conflicted"],
        "definition": "(of two or more people) fully in agreement.",
        "example": "The decision was _____."
    },
    {
        "word": "congested",
        "difficulty": 4,
        "theme": "Description",
        "distractors": ["empty", "clear", "flowing"],
        "definition": "(of a road or place) so crowded with traffic or people as to hinder freedom of movement.",
        "example": "The streets were _____ with traffic."
    },
    {
        "word": "composed",
        "difficulty": 5,
        "theme": "Emotions",
        "distractors": ["agitated", "hysterical", "upset"],
        "definition": "Having one's feelings and expression under control; calm.",
        "example": "She remained _____ throughout the crisis."
    },
    {
        "word": "effective",
        "difficulty": 4,
        "theme": "Description",
        "distractors": ["useless", "fruitless", "vain"],
        "definition": "Successful in producing a desired or intended result.",
        "example": "The medicine was very _____."
    },
    {
        "word": "neurotic",
        "difficulty": 5,
        "theme": "Personality",
        "distractors": ["balanced", "stable", "sane"],
        "definition": "Abnormally sensitive, obsessive, or tense and anxious.",
        "example": "He is _____ about cleanliness."
    },
    {
        "word": "turbulent",
        "difficulty": 5,
        "theme": "Nature",
        "distractors": ["calm", "peaceful", "still"],
        "definition": "Characterized by conflict, disorder, or confusion; not controlled or calm.",
        "example": "The flight was very _____."
    },
    {
        "word": "innate",
        "difficulty": 6,
        "theme": "Ability",
        "distractors": ["acquired", "learned", "gained"],
        "definition": "Inborn; natural.",
        "example": "She has an _____ ability to learn languages."
    },
    {
        "word": "engrossing",
        "difficulty": 5,
        "theme": "Description",
        "distractors": ["dull", "tedious", "monotonous"],
        "definition": "Absorbing all one's attention or interest.",
        "example": "The movie was completely _____."
    },
    {
        "word": "snide",
        "difficulty": 5,
        "theme": "Social Interaction",
        "distractors": ["complimentary", "kind", "nice"],
        "definition": "Derogatory or mocking in an indirect way.",
        "example": "He made a _____ remark about her outfit."
    },
    {
        "word": "imposing",
        "difficulty": 5,
        "theme": "Description",
        "distractors": ["modest", "small", "unassuming"],
        "definition": "Grand and impressive in appearance.",
        "example": "The castle was an _____ structure."
    },
    {
        "word": "ecstatic",
        "difficulty": 5,
        "theme": "Emotions",
        "distractors": ["despairing", "sad", "unhappy"],
        "definition": "Feeling or expressing overwhelming happiness or joyful excitement.",
        "example": "She was _____ when she got the job."
    },
    {
        "word": "pristine",
        "difficulty": 6,
        "theme": "Nature",
        "distractors": ["dirty", "polluted", "ruined"],
        "definition": "In its original condition; unspoiled.",
        "example": "The beach was _____ and beautiful."
    },
    
    # Difficulty 7-10
    {
        "word": "jubilant",
        "difficulty": 7,
        "theme": "Emotions",
        "distractors": ["despondent", "melancholy", "downcast"],
        "definition": "Feeling or expressing great happiness and triumph.",
        "example": "The crowd was _____ after the victory."
    },
    {
        "word": "cacophonous",
        "difficulty": 8,
        "theme": "Description",
        "distractors": ["harmonious", "melodious", "dulcet"],
        "definition": "Involving or producing a harsh, discordant mixture of sounds.",
        "example": "The city street was _____ with traffic noise."
    },
    {
        "word": "conscientious",
        "difficulty": 7,
        "theme": "Personality",
        "distractors": ["remiss", "lax", "negligent"],
        "definition": "(of a person) wishing to do one's work or duty well and thoroughly.",
        "example": "She is a _____ student who always does her homework."
    },
    {
        "word": "breathtaking",
        "difficulty": 7,
        "theme": "Description",
        "distractors": ["uninspiring", "pedestrian", "boring"],
        "definition": "Astonishing or awe-inspiring in quality, so as to take one's breath away.",
        "example": "The view from the summit was _____."
    },
    {
        "word": "apprehensive",
        "difficulty": 7,
        "theme": "Emotions",
        "distractors": ["confident", "assured", "certain"],
        "definition": "Anxious or fearful that something bad or unpleasant will happen.",
        "example": "He was _____ about the upcoming surgery."
    },
    {
        "word": "esoteric",
        "difficulty": 8,
        "theme": "Description",
        "distractors": ["common", "exoteric", "simple"],
        "definition": "Intended for or likely to be understood by only a small number of people with a specialized knowledge or interest.",
        "example": "The lecture was on an _____ philosophical topic."
    },
    {
        "word": "impetuous",
        "difficulty": 7,
        "theme": "Behavior",
        "distractors": ["deliberate", "circumspect", "cautious"],
        "definition": "Acting or done quickly and without thought or care.",
        "example": "It was an _____ decision to buy the car."
    },
    {
        "word": "catastrophic",
        "difficulty": 7,
        "theme": "Nature",
        "distractors": ["beneficial", "advantageous", "helpful"],
        "definition": "Involving or causing sudden great damage or suffering.",
        "example": "The earthquake had _____ results."
    },
    {
        "word": "capricious",
        "difficulty": 8,
        "theme": "Behavior",
        "distractors": ["steadfast", "constant", "reliable"],
        "definition": "Given to sudden and unaccountable changes of mood or behavior.",
        "example": "The king was a _____ ruler."
    },
    {
        "word": "epochal",
        "difficulty": 9,
        "theme": "Description",
        "distractors": ["trivial", "inconsequential", "minor"],
        "definition": "Forming or characterizing an epoch; epoch-making.",
        "example": "The invention of the internet was an _____ event."
    },
    {
        "word": "audacious",
        "difficulty": 7,
        "theme": "Behavior",
        "distractors": ["timid", "fearful", "meek"],
        "definition": "Showing a willingness to take surprisingly bold risks.",
        "example": "He made an _____ plan to escape."
    },
    {
        "word": "portentous",
        "difficulty": 8,
        "theme": "Description",
        "distractors": ["insignificant", "unimportant", "trivial"],
        "definition": "Of or like a portent.",
        "example": "The thunder was a _____ sign of the storm to come."
    },
    {
        "word": "effulgent",
        "difficulty": 9,
        "theme": "Description",
        "distractors": ["dull", "gloomy", "dim"],
        "definition": "Shining brightly; radiant.",
        "example": "The _____ sun warmed the earth."
    },
    {
        "word": "fastidious",
        "difficulty": 8,
        "theme": "Personality",
        "distractors": ["uncritical", "easygoing", "sloppy"],
        "definition": "Very attentive to and concerned about accuracy and detail.",
        "example": "He is _____ about his appearance."
    },
    {
        "word": "serene",
        "difficulty": 7,
        "theme": "Description",
        "distractors": ["tumultuous", "agitated", "stormy"],
        "definition": "Calm, peaceful, and untroubled; tranquil.",
        "example": "Her face was _____ and happy."
    },
    {
        "word": "relinquished",
        "difficulty": 7,
        "theme": "Action",
        "distractors": ["retained", "kept", "withheld"],
        "definition": "Voluntarily cease to keep or claim; give up.",
        "example": "He _____ his claim to the throne."
    },
    {
        "word": "concocted",
        "difficulty": 7,
        "theme": "Action",
        "distractors": ["destroyed", "ruined", "demolished"],
        "definition": "Create or devise (said especially of a story or plan).",
        "example": "They _____ a plan to surprise her."
    },
    {
        "word": "quelled",
        "difficulty": 8,
        "theme": "Action",
        "distractors": ["incited", "agitated", "provoked"],
        "definition": "Put an end to (a rebellion or other disorder), typically by the use of force.",
        "example": "The police _____ the riot."
    },
    {
        "word": "substantiated",
        "difficulty": 8,
        "theme": "Action",
        "distractors": ["disproved", "refuted", "invalidated"],
        "definition": "Provide evidence to support or prove the truth of.",
        "example": "The evidence _____ his claim."
    },
    {
        "word": "uphold",
        "difficulty": 7,
        "theme": "Action",
        "distractors": ["violate", "breach", "break"],
        "definition": "Confirm or support (something which has been questioned).",
        "example": "We must _____ the law."
    },
    {
        "word": "flabbergasted",
        "difficulty": 8,
        "theme": "Emotions",
        "distractors": ["unsurprised", "expectant", "calm"],
        "definition": "Greatly surprised; astonished.",
        "example": "I was _____ by the news."
    },
    {
        "word": "lucid",
        "difficulty": 7,
        "theme": "Description",
        "distractors": ["obscure", "vague", "ambiguous"],
        "definition": "Expressed clearly; easy to understand.",
        "example": "His explanation was _____ and helpful."
    },
    {
        "word": "infallible",
        "difficulty": 8,
        "theme": "Ability",
        "distractors": ["errant", "fallible", "flawed"],
        "definition": "Incapable of making mistakes or being wrong.",
        "example": "No one is _____."
    },
    {
        "word": "pungent",
        "difficulty": 7,
        "theme": "Description",
        "distractors": ["mild", "bland", "tasteless"],
        "definition": "Having a sharply strong taste or smell.",
        "example": "The onions had a _____ smell."
    },
    {
        "word": "imperative",
        "difficulty": 7,
        "theme": "Importance",
        "distractors": ["unnecessary", "optional", "trivial"],
        "definition": "Of vital importance; crucial.",
        "example": "It is _____ that we act now."
    },
    {
        "word": "pensive",
        "difficulty": 7,
        "theme": "Personality",
        "distractors": ["shallow", "ignorant", "uncaring"],
        "definition": "Engaged in, involving, or reflecting deep or serious thought.",
        "example": "She looked _____ as she gazed out the window."
    },
    {
        "word": "ornate",
        "difficulty": 7,
        "theme": "Description",
        "distractors": ["austere", "plain", "stark"],
        "definition": "Made in an intricate shape or decorated with complex patterns.",
        "example": "The room was filled with _____ furniture."
    },
    {
        "word": "articulate",
        "difficulty": 7,
        "theme": "Description",
        "distractors": ["incoherent", "unintelligible", "mute"],
        "definition": "(of a person or a person's words) having or showing the ability to speak fluently and coherently.",
        "example": "She is an _____ speaker."
    },
    {
        "word": "amenable",
        "difficulty": 8,
        "theme": "Personality",
        "distractors": ["recalcitrant", "intractable", "stubborn"],
        "definition": "(of a person) open and responsive to suggestion; easily persuaded or controlled.",
        "example": "He was _____ to the idea."
    },
    {
        "word": "circuitous",
        "difficulty": 8,
        "theme": "Nature",
        "distractors": ["direct", "straight", "linear"],
        "definition": "(of a route or journey) longer than the most direct way.",
        "example": "We took a _____ route to avoid traffic."
    },
    {
        "word": "desolate",
        "difficulty": 7,
        "theme": "Emotions",
        "distractors": ["joyful", "hopeful", "cheerful"],
        "definition": "(of a place) deserted of people and in a state of bleak and dismal emptiness.",
        "example": "The landscape was _____ and barren."
    },
    {
        "word": "impeccable",
        "difficulty": 8,
        "theme": "Description",
        "distractors": ["defective", "faulty", "imperfect"],
        "definition": "(of behavior, performance, or appearance) in accordance with the highest standards of propriety; faultless.",
        "example": "Her manners were _____."
    },
    {
        "word": "affable",
        "difficulty": 7,
        "theme": "Personality",
        "distractors": ["surly", "hostile", "unfriendly"],
        "definition": "Friendly, good-natured, or easy to talk to.",
        "example": "He was an _____ host."
    },
    {
        "word": "insuperable",
        "difficulty": 9,
        "theme": "Description",
        "distractors": ["conquerable", "surmountable", "easy"],
        "definition": "(of a difficulty or obstacle) impossible to overcome.",
        "example": "The problem seemed _____."
    },
    {
        "word": "covetous",
        "difficulty": 8,
        "theme": "Emotions",
        "distractors": ["benevolent", "generous", "charitable"],
        "definition": "Having or showing a great desire to possess something, typically something belonging to someone else.",
        "example": "He looked at the car with _____ eyes."
    },
    {
        "word": "voracious",
        "difficulty": 8,
        "theme": "Description",
        "distractors": ["satisfied", "full", "quenched"],
        "definition": "Wanting or devouring great quantities of food.",
        "example": "He has a _____ appetite."
    },
    {
        "word": "magnanimous",
        "difficulty": 9,
        "theme": "Social Interaction",
        "distractors": ["petty", "mean", "vindictive"],
        "definition": "Generous or forgiving, especially toward a rival or less powerful person.",
        "example": "He was _____ in victory."
    },
    {
        "word": "kaleidoscopic",
        "difficulty": 9,
        "theme": "Nature",
        "distractors": ["monochrome", "dull", "static"],
        "definition": "Made up of a complex pattern of colors.",
        "example": "The festival was a _____ display of culture."
    },
    {
        "word": "unanimous",
        "difficulty": 7,
        "theme": "Social Interaction",
        "distractors": ["discordant", "disagreeing", "split"],
        "definition": "(of two or more people) fully in agreement.",
        "example": "The jury reached a _____ verdict."
    },
    {
        "word": "gridlocked",
        "difficulty": 7,
        "theme": "Description",
        "distractors": ["free", "moving", "fluid"],
        "definition": "Obstructed by a gridlock.",
        "example": "The city was _____ during rush hour."
    },
    {
        "word": "stoic",
        "difficulty": 8,
        "theme": "Emotions",
        "distractors": ["emotional", "demonstrative", "volatile"],
        "definition": "A person who can endure pain or hardship without showing their feelings or complaining.",
        "example": "He remained _____ despite the bad news."
    },
    {
        "word": "efficacious",
        "difficulty": 9,
        "theme": "Description",
        "distractors": ["ineffective", "useless", "vain"],
        "definition": "(typically of something inanimate or abstract) successful in producing a desired or intended result; effective.",
        "example": "The treatment was highly _____."
    },
    {
        "word": "hypochondriac",
        "difficulty": 8,
        "theme": "Personality",
        "distractors": ["healthy", "unconcerned", "well"],
        "definition": "A person who is abnormally anxious about their health.",
        "example": "He is a bit of a _____."
    },
    {
        "word": "tempestuous",
        "difficulty": 8,
        "theme": "Nature",
        "distractors": ["calm", "placid", "tranquil"],
        "definition": "Characterized by strong and turbulent or conflicting emotion.",
        "example": "They had a _____ relationship."
    },
    {
        "word": "inherent",
        "difficulty": 7,
        "theme": "Ability",
        "distractors": ["extraneous", "external", "alien"],
        "definition": "Existing in something as a permanent, essential, or characteristic attribute.",
        "example": "There are risks _____ in the sport."
    },
    {
        "word": "riveting",
        "difficulty": 7,
        "theme": "Description",
        "distractors": ["boring", "dull", "monotonous"],
        "definition": "Completely engrossing; compelling.",
        "example": "The documentary was _____."
    },
    {
        "word": "disparaging",
        "difficulty": 8,
        "theme": "Social Interaction",
        "distractors": ["complimentary", "praising", "laudatory"],
        "definition": "Expressing the opinion that something is of little worth; derogatory.",
        "example": "He made _____ remarks about his opponent."
    },
    {
        "word": "monumental",
        "difficulty": 7,
        "theme": "Description",
        "distractors": ["minuscule", "tiny", "small"],
        "definition": "Great in importance, extent, or size.",
        "example": "It was a _____ achievement."
    },
    {
        "word": "euphoric",
        "difficulty": 8,
        "theme": "Emotions",
        "distractors": ["dysphoric", "sad", "depressed"],
        "definition": "Characterized by or feeling intense excitement and happiness.",
        "example": "The fans were _____ after the win."
    },
    {
        "word": "limpid",
        "difficulty": 9,
        "theme": "Nature",
        "distractors": ["turbid", "muddy", "cloudy"],
        "definition": "(of a liquid) free of anything that darkens; completely clear.",
        "example": "The pool was filled with _____ water."
    }
]

def get_distractors(correct_word, bank, count=3):
    # Try to find words with similar difficulty
    candidates = [w['word'] for w in bank if w['word'] != correct_word]
    if len(candidates) < count:
        return ["optionA", "optionB", "optionC"] # Fallback
    return random.sample(candidates, count)

def generate_questions(original_questions):
    questions = []
    
    # Target: 2000 total
    target_count = 2000
    generated_count = 0
    
    # Create an extended list to iterate through to ensure we get enough
    # We will loop enough times to cover the target
    extended_bank = vocab_bank * (target_count // len(vocab_bank) + 2)
    random.shuffle(extended_bank)

    for word_data in extended_bank:
        if generated_count >= target_count:
            break
            
        word = word_data['word']
        diff = word_data['difficulty']
        theme = word_data['theme']
        specific_distractors = word_data['distractors']
        definition = word_data['definition']
        example = word_data['example']
        
        # Construct Question from Example
        q_text = example # The example already has the blank "_____"
        
        # Options
        opts = specific_distractors[:]
        if len(opts) < 3:
            opts = get_distractors(word, vocab_bank)
            
        final_options = opts + [word]
        random.shuffle(final_options)
        
        # Format options dictionary
        options_dict = {
            "1": final_options[0],
            "2": final_options[1],
            "3": final_options[2],
            "4": final_options[3]
        }
        
        # Find answer index
        ans_index = final_options.index(word) + 1
        
        new_q = {
            "question_number": len(questions) + 1,
            "question": q_text,
            "options": options_dict,
            "answer": word,
            "answer_index": ans_index,
            "theme": theme,
            "difficulty": diff,
            "definition": definition,
            "example": example.replace("_____", word) # Store full example for reference/tooltips
        }
        
        questions.append(new_q)
        generated_count += 1

    return questions

if __name__ == "__main__":
    # Path to src/data/questions.json (output)
    output_path = os.path.join(os.path.dirname(__file__), '../src/data/questions.json')
    
    try:
        # We generate purely from our new high-quality bank
        all_questions = generate_questions([])
        
        with open(output_path, "w") as f:
            json.dump(all_questions, f, indent=2)
            
        print(f"Successfully generated {len(all_questions)} questions in {output_path}")
        
    except Exception as e:
        print(f"Error: {e}")
