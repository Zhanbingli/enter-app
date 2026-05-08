import type { TinyStory } from "../types";

export const tinyStories: TinyStory[] = [
  {
    id: "desk-ghost-rent",
    title: "Desk Ghost, No Lease",
    scenario:
      "A ghost is sitting on your desk. It says it is not haunting anyone, just avoiding rent.",
    startStepId: "start",
    steps: [
      {
        id: "start",
        text: "The ghost has a tiny suitcase, a receipt for one candle, and the confidence of someone who has never paid a deposit.",
        choices: [
          { label: "Ask about the suitcase", nextStepId: "suitcase" },
          { label: "Offer it a coaster", nextStepId: "coaster" },
          { label: "Pretend this is normal", nextStepId: "normal" }
        ]
      },
      {
        id: "suitcase",
        text: "The suitcase contains one transparent sock and a spoon labeled emergency thunder.",
        choices: [
          { label: "Respect the spoon", nextStepId: "end-spoon" },
          { label: "Ask about thunder", nextStepId: "end-thunder" }
        ]
      },
      {
        id: "coaster",
        text: "The ghost floats its mug over the coaster and whispers that boundaries are complicated after death.",
        choices: [
          { label: "Nod wisely", nextStepId: "end-coaster" },
          { label: "Slide the coaster left", nextStepId: "end-left" }
        ]
      },
      {
        id: "normal",
        text: "The ghost relaxes immediately. It says nobody has ever been so chill about unpaid desk occupancy.",
        choices: [
          { label: "Grant a desk corner", nextStepId: "end-lease" },
          { label: "Charge one button", nextStepId: "end-button" }
        ]
      },
      {
        id: "end-spoon",
        text: "The spoon vibrates once. The ghost salutes. A distant cloud feels briefly organized.",
        ending: "The desk is now technically a weather station."
      },
      {
        id: "end-thunder",
        text: "The ghost says thunder is just sky furniture falling over, then looks proud and embarrassed.",
        ending: "You have learned nothing useful, which feels appropriate."
      },
      {
        id: "end-coaster",
        text: "The ghost appreciates the nod and writes you into its will. The will is a napkin with fog on it.",
        ending: "You inherit half a candle and an unclear responsibility."
      },
      {
        id: "end-left",
        text: "The coaster drifts left, then the ghost drifts left, then the whole situation becomes slightly tidier.",
        ending: "A small domestic miracle has occurred."
      },
      {
        id: "end-lease",
        text: "The ghost signs a lease in invisible ink, then immediately forgets where it put itself.",
        ending: "Your desk has a roommate, probably."
      },
      {
        id: "end-button",
        text: "The ghost pays with a button from 1987 and demands a receipt shaped like a moon.",
        ending: "The transaction is legally adorable and financially meaningless."
      }
    ]
  },
  {
    id: "elevator-moon",
    title: "Elevator to the Moonish Floor",
    scenario:
      "An elevator opens in your hallway. The panel has buttons for 1, 2, Moonish, and Basement With Feelings.",
    startStepId: "start",
    steps: [
      {
        id: "start",
        text: "A small bell dings. Inside, a floor mat says please wipe your existential dust.",
        choices: [
          { label: "Press Moonish", nextStepId: "moonish" },
          { label: "Press Basement With Feelings", nextStepId: "basement" },
          { label: "Press 2 twice", nextStepId: "two" }
        ]
      },
      {
        id: "moonish",
        text: "The doors open to a place that is not the moon, but has clearly read about it.",
        choices: [
          { label: "Step onto the soft crater", nextStepId: "end-crater" },
          { label: "Compliment the gravity", nextStepId: "end-gravity" }
        ]
      },
      {
        id: "basement",
        text: "The basement sighs and shows you a shelf of jars labeled almost, maybe, and left sock.",
        choices: [
          { label: "Open maybe", nextStepId: "end-maybe" },
          { label: "Leave sock alone", nextStepId: "end-sock" }
        ]
      },
      {
        id: "two",
        text: "The elevator respects the drama and takes you to floor 22, which is just floor 2 wearing a hat.",
        choices: [
          { label: "Tip the hat", nextStepId: "end-hat" },
          { label: "Ask for regular 2", nextStepId: "end-regular" }
        ]
      },
      {
        id: "end-crater",
        text: "The crater squeaks like a bath toy and pretends it did not.",
        ending: "Moonish remains dignified, but only barely."
      },
      {
        id: "end-gravity",
        text: "Gravity blushes and becomes 4 percent lighter for a moment.",
        ending: "You float just enough to feel fancy."
      },
      {
        id: "end-maybe",
        text: "The jar contains a tiny shrug wearing suspenders.",
        ending: "It escapes under the shelf to consider its options."
      },
      {
        id: "end-sock",
        text: "The sock nods from inside the jar. Some mysteries appreciate privacy.",
        ending: "The basement feels respected and stops sighing."
      },
      {
        id: "end-hat",
        text: "The hat tips back. Floor 22 has excellent manners and no useful exits.",
        ending: "The elevator takes you home out of professional courtesy."
      },
      {
        id: "end-regular",
        text: "The doors close, open again, and reveal regular floor 2 looking offended but available.",
        ending: "Transportation has occurred, technically."
      }
    ]
  },
  {
    id: "pocket-committee",
    title: "Pocket Committee",
    scenario:
      "Your pocket has formed a committee. The lint is chairperson. A coin keeps interrupting.",
    startStepId: "start",
    steps: [
      {
        id: "start",
        text: "The agenda is handwritten on a gum wrapper and includes one urgent item: why are we always sideways?",
        choices: [
          { label: "Let lint speak first", nextStepId: "lint" },
          { label: "Recognize the coin", nextStepId: "coin" },
          { label: "Shake the pocket gently", nextStepId: "shake" }
        ]
      },
      {
        id: "lint",
        text: "Lint proposes a softer future with fewer keys and more respect for fuzz-based leadership.",
        choices: [
          { label: "Second the motion", nextStepId: "end-fuzz" },
          { label: "Ask for details", nextStepId: "end-details" }
        ]
      },
      {
        id: "coin",
        text: "The coin claims it has been heads-up emotionally for years, despite mixed evidence.",
        choices: [
          { label: "Accept the claim", nextStepId: "end-heads" },
          { label: "Request a flip", nextStepId: "end-flip" }
        ]
      },
      {
        id: "shake",
        text: "The committee interprets the shake as applause and passes three bylaws immediately.",
        choices: [
          { label: "Read bylaw one", nextStepId: "end-bylaw" },
          { label: "Adjourn quickly", nextStepId: "end-adjourn" }
        ]
      },
      {
        id: "end-fuzz",
        text: "The motion passes. Lint celebrates by becoming slightly more lint.",
        ending: "A soft political era begins."
      },
      {
        id: "end-details",
        text: "Lint provides a 47-page plan made entirely of texture.",
        ending: "It is unreadable but persuasive."
      },
      {
        id: "end-heads",
        text: "The coin shines with relief and immediately rolls behind a receipt.",
        ending: "Leadership is slippery today."
      },
      {
        id: "end-flip",
        text: "The coin flips, lands sideways somehow, and calls it nuance.",
        ending: "The committee applauds the ambiguity."
      },
      {
        id: "end-bylaw",
        text: "Bylaw one declares all crumbs to be visitors, not clutter.",
        ending: "The pocket becomes more welcoming and less washable."
      },
      {
        id: "end-adjourn",
        text: "Everyone agrees to adjourn. The gum wrapper takes minutes nobody will read.",
        ending: "Democracy returns to being tiny and wrinkled."
      }
    ]
  },
  {
    id: "cloud-customer-service",
    title: "Cloud Customer Service",
    scenario:
      "A cloud lowers a little ticket booth outside your window. It is taking complaints about shapes.",
    startStepId: "start",
    steps: [
      {
        id: "start",
        text: "The cloud clerk wears a name tag that says Brenda, maybe. The maybe is part of the tag.",
        choices: [
          { label: "Complain about triangles", nextStepId: "triangles" },
          { label: "Praise a blob", nextStepId: "blob" },
          { label: "Ask for a receipt", nextStepId: "receipt" }
        ]
      },
      {
        id: "triangles",
        text: "Brenda, maybe, nods solemnly and stamps your complaint with a damp puff.",
        choices: [
          { label: "Request action", nextStepId: "end-action" },
          { label: "Withdraw complaint", nextStepId: "end-withdraw" }
        ]
      },
      {
        id: "blob",
        text: "The blob puffs larger with pride and accidentally becomes a potato for three seconds.",
        choices: [
          { label: "Applaud quietly", nextStepId: "end-potato" },
          { label: "Look official", nextStepId: "end-official" }
        ]
      },
      {
        id: "receipt",
        text: "The receipt is a strip of mist that vanishes before tax season can hurt it.",
        choices: [
          { label: "Accept that", nextStepId: "end-mist" },
          { label: "Ask for a copy", nextStepId: "end-copy" }
        ]
      },
      {
        id: "end-action",
        text: "The cloud turns one triangle into a soft lump. It looks relieved to stop having corners.",
        ending: "A minor atmospheric policy has changed."
      },
      {
        id: "end-withdraw",
        text: "Brenda, maybe, thanks you for your flexibility and becomes a sandwich shape out of gratitude.",
        ending: "The sky takes lunch seriously."
      },
      {
        id: "end-potato",
        text: "The potato cloud bows so low it becomes fog.",
        ending: "Your applause was too powerful."
      },
      {
        id: "end-official",
        text: "Looking official causes three nearby clouds to form a queue.",
        ending: "You are promoted by accident."
      },
      {
        id: "end-mist",
        text: "The mist receipt signs itself with a tiny damp flourish.",
        ending: "Accounting remains impossible but elegant."
      },
      {
        id: "end-copy",
        text: "The copy is also mist. Brenda, maybe, says that is how copies work upstairs.",
        ending: "You cannot argue with weather bureaucracy."
      }
    ]
  },
  {
    id: "chair-interview",
    title: "Chair Interview",
    scenario:
      "A chair applies for a new position as a table. Its resume is mostly scratches and confidence.",
    startStepId: "start",
    steps: [
      {
        id: "start",
        text: "The chair sits very upright, which is either professionalism or a conflict of interest.",
        choices: [
          { label: "Ask about experience", nextStepId: "experience" },
          { label: "Test table skills", nextStepId: "test" },
          { label: "Offer feedback", nextStepId: "feedback" }
        ]
      },
      {
        id: "experience",
        text: "It says it has supported bowls, bags, and one emotionally heavy coat.",
        choices: [
          { label: "Hire it", nextStepId: "end-hire" },
          { label: "Ask about coat", nextStepId: "end-coat" }
        ]
      },
      {
        id: "test",
        text: "You place a cup on it. The chair holds still with terrifying focus.",
        choices: [
          { label: "Approve the cup", nextStepId: "end-cup" },
          { label: "Add a spoon", nextStepId: "end-spoon" }
        ]
      },
      {
        id: "feedback",
        text: "The chair accepts feedback by creaking once and looking exactly the same.",
        choices: [
          { label: "Praise growth", nextStepId: "end-growth" },
          { label: "End interview", nextStepId: "end-interview" }
        ]
      },
      {
        id: "end-hire",
        text: "The chair becomes a table on weekends and remains mysterious about weekdays.",
        ending: "Flexible employment has arrived."
      },
      {
        id: "end-coat",
        text: "The coat apparently had unresolved scarf issues. The chair handled it with grace.",
        ending: "References check out."
      },
      {
        id: "end-cup",
        text: "The cup stays upright. The chair does not brag, which is classy.",
        ending: "A quiet promotion seems fair."
      },
      {
        id: "end-spoon",
        text: "The spoon slides off immediately, but with such style that everyone pretends it was planned.",
        ending: "The interview becomes avant-garde."
      },
      {
        id: "end-growth",
        text: "The chair creaks again, softer this time. Personal development has four legs.",
        ending: "No one knows what improved, but the mood is nice."
      },
      {
        id: "end-interview",
        text: "The chair thanks you by remaining available to sit on.",
        ending: "A practical fallback."
      }
    ]
  },
  {
    id: "mirror-mail",
    title: "Mirror Mail",
    scenario:
      "Your mirror receives a letter addressed to the person standing slightly to your left.",
    startStepId: "start",
    steps: [
      {
        id: "start",
        text: "The envelope is shiny, blank, and somehow smells like hallway.",
        choices: [
          { label: "Open it carefully", nextStepId: "open" },
          { label: "Return to sender", nextStepId: "return" },
          { label: "Stand slightly left", nextStepId: "left" }
        ]
      },
      {
        id: "open",
        text: "Inside is a note that says: your reflection has been promoted to assistant reflection.",
        choices: [
          { label: "Congratulate it", nextStepId: "end-congrats" },
          { label: "Ask about benefits", nextStepId: "end-benefits" }
        ]
      },
      {
        id: "return",
        text: "The mirror refuses the return and writes no forwarding address on itself in steam.",
        choices: [
          { label: "Accept defeat", nextStepId: "end-defeat" },
          { label: "Draw a stamp", nextStepId: "end-stamp" }
        ]
      },
      {
        id: "left",
        text: "Standing slightly left causes the letter to hum. It has been waiting for basic geometry.",
        choices: [
          { label: "Hum back", nextStepId: "end-hum" },
          { label: "Step right again", nextStepId: "end-right" }
        ]
      },
      {
        id: "end-congrats",
        text: "Your reflection bows half a second late and looks extremely employed.",
        ending: "The mirror office celebrates quietly."
      },
      {
        id: "end-benefits",
        text: "Benefits include fog days, frame access, and one free ominous glance per quarter.",
        ending: "Honestly, not terrible."
      },
      {
        id: "end-defeat",
        text: "The mirror looks smug for a reflective surface.",
        ending: "Postal law loses another round."
      },
      {
        id: "end-stamp",
        text: "The stamp looks like a tiny couch. The mirror accepts it with bureaucratic softness.",
        ending: "Mail has become furniture-adjacent."
      },
      {
        id: "end-hum",
        text: "The mirror harmonizes poorly but with feeling.",
        ending: "A duet happens without permission."
      },
      {
        id: "end-right",
        text: "The letter stops humming and sulks into a rectangle.",
        ending: "Geometry remains sensitive."
      }
    ]
  },
  {
    id: "noodle-oracle",
    title: "Noodle Oracle",
    scenario:
      "A noodle in a bowl arranges itself into a prophecy. It mostly looks like a tired question mark.",
    startStepId: "start",
    steps: [
      {
        id: "start",
        text: "Steam rises with the seriousness of a tiny council. The noodle waits for interpretation.",
        choices: [
          { label: "Read the prophecy", nextStepId: "read" },
          { label: "Stir respectfully", nextStepId: "stir" },
          { label: "Ask the broth", nextStepId: "broth" }
        ]
      },
      {
        id: "read",
        text: "The prophecy says something like soon, perhaps, left shoe. It is hard to know with noodles.",
        choices: [
          { label: "Believe it", nextStepId: "end-believe" },
          { label: "Request clarity", nextStepId: "end-clarity" }
        ]
      },
      {
        id: "stir",
        text: "The noodle becomes an exclamation point, then immediately loses confidence.",
        choices: [
          { label: "Encourage it", nextStepId: "end-encourage" },
          { label: "Let it float", nextStepId: "end-float" }
        ]
      },
      {
        id: "broth",
        text: "The broth says all prophecies are better with pepper.",
        choices: [
          { label: "Add pepper", nextStepId: "end-pepper" },
          { label: "Respect plain broth", nextStepId: "end-plain" }
        ]
      },
      {
        id: "end-believe",
        text: "The left shoe feels important for no reason. The noodle relaxes.",
        ending: "Destiny is warm and slightly salty."
      },
      {
        id: "end-clarity",
        text: "The noodle forms a comma. That is not clarity, but it is punctuation.",
        ending: "The oracle remains employed."
      },
      {
        id: "end-encourage",
        text: "The noodle straightens for half a second, then returns to being deliciously uncertain.",
        ending: "Confidence is temporary. Soup is now."
      },
      {
        id: "end-float",
        text: "The noodle drifts away from responsibility.",
        ending: "A peaceful career change."
      },
      {
        id: "end-pepper",
        text: "Pepper lands like tiny meteorites. The broth becomes extremely dramatic.",
        ending: "The prophecy gets spicier but not clearer."
      },
      {
        id: "end-plain",
        text: "The broth appreciates being heard and produces one dignified bubble.",
        ending: "Minimalism wins lunch."
      }
    ]
  },
  {
    id: "umbrella-court",
    title: "Umbrella Court",
    scenario:
      "An umbrella opens indoors and immediately demands a trial by carpet.",
    startStepId: "start",
    steps: [
      {
        id: "start",
        text: "The carpet seems unprepared for legal duty but agrees because it is flat and available.",
        choices: [
          { label: "Defend the umbrella", nextStepId: "defend" },
          { label: "Call the doormat", nextStepId: "doormat" },
          { label: "Settle out of court", nextStepId: "settle" }
        ]
      },
      {
        id: "defend",
        text: "You argue the umbrella simply wanted to feel useful in a dry economy.",
        choices: [
          { label: "Rest your case", nextStepId: "end-rest" },
          { label: "Open evidence", nextStepId: "end-evidence" }
        ]
      },
      {
        id: "doormat",
        text: "The doormat arrives with dirt on its shoes, which feels hypocritical but compelling.",
        choices: [
          { label: "Hear testimony", nextStepId: "end-testimony" },
          { label: "Question the dirt", nextStepId: "end-dirt" }
        ]
      },
      {
        id: "settle",
        text: "The umbrella agrees to stand quietly in the corner and stop making folklore nervous.",
        choices: [
          { label: "Shake hands", nextStepId: "end-hands" },
          { label: "Fold agreement", nextStepId: "end-fold" }
        ]
      },
      {
        id: "end-rest",
        text: "The carpet deliberates by remaining carpet. The verdict is soft.",
        ending: "The umbrella is released with a mild creak."
      },
      {
        id: "end-evidence",
        text: "The evidence is a single raindrop from three weeks ago. Everyone leans in.",
        ending: "The case becomes historical."
      },
      {
        id: "end-testimony",
        text: "The doormat says it has seen things and refuses to elaborate.",
        ending: "Powerful witness. Terrible details."
      },
      {
        id: "end-dirt",
        text: "The dirt pleads no contest and scatters slightly.",
        ending: "Justice becomes a small vacuum problem."
      },
      {
        id: "end-hands",
        text: "Shaking hands with an umbrella is awkward but symbolically damp.",
        ending: "Peace returns indoors."
      },
      {
        id: "end-fold",
        text: "The agreement folds into eight ribs and a tiny sigh.",
        ending: "Contract law has never been so portable."
      }
    ]
  },
  {
    id: "clock-sneezes",
    title: "Clock Sneezes",
    scenario:
      "A clock sneezes and loses seven minutes under the couch.",
    startStepId: "start",
    steps: [
      {
        id: "start",
        text: "The clock looks embarrassed. The couch looks like it knew this would happen.",
        choices: [
          { label: "Search for minutes", nextStepId: "search" },
          { label: "Comfort the clock", nextStepId: "comfort" },
          { label: "Question the couch", nextStepId: "couch" }
        ]
      },
      {
        id: "search",
        text: "You find dust, a pen cap, and Tuesday afternoon folded in half.",
        choices: [
          { label: "Unfold Tuesday", nextStepId: "end-tuesday" },
          { label: "Return the pen cap", nextStepId: "end-pen" }
        ]
      },
      {
        id: "comfort",
        text: "The clock ticks softly and admits it has seasonal allergies to deadlines.",
        choices: [
          { label: "Offer a tissue", nextStepId: "end-tissue" },
          { label: "Offer patience", nextStepId: "end-patience" }
        ]
      },
      {
        id: "couch",
        text: "The couch refuses to answer without cushions present.",
        choices: [
          { label: "Summon cushions", nextStepId: "end-cushions" },
          { label: "Proceed without them", nextStepId: "end-proceed" }
        ]
      },
      {
        id: "end-tuesday",
        text: "Tuesday pops open and smells faintly like errands.",
        ending: "Time is back, but now it has lint."
      },
      {
        id: "end-pen",
        text: "The pen cap clicks onto nothing and seems satisfied anyway.",
        ending: "Closure is sometimes symbolic."
      },
      {
        id: "end-tissue",
        text: "The clock accepts the tissue and blows 3:14 p.m. into it.",
        ending: "The room feels oddly punctual."
      },
      {
        id: "end-patience",
        text: "Patience works immediately, which is rude but helpful.",
        ending: "The clock regains four minutes and a little dignity."
      },
      {
        id: "end-cushions",
        text: "The cushions arrive late and sit on the evidence.",
        ending: "Classic cushion behavior."
      },
      {
        id: "end-proceed",
        text: "The couch says nothing, but one missing minute rolls out with a guilty wobble.",
        ending: "A partial victory for furniture law."
      }
    ]
  },
  {
    id: "toast-lighthouse",
    title: "Toast Lighthouse",
    scenario:
      "A piece of toast on a plate starts blinking like a lighthouse for lost crumbs.",
    startStepId: "start",
    steps: [
      {
        id: "start",
        text: "Tiny crumbs gather near the plate rim, blinking back with the courage of breakfast debris.",
        choices: [
          { label: "Guide the crumbs", nextStepId: "guide" },
          { label: "Butter the beacon", nextStepId: "butter" },
          { label: "Ask who is lost", nextStepId: "lost" }
        ]
      },
      {
        id: "guide",
        text: "The crumbs form a line and begin a slow heroic walk across the plate.",
        choices: [
          { label: "Clear a path", nextStepId: "end-path" },
          { label: "Name the captain", nextStepId: "end-captain" }
        ]
      },
      {
        id: "butter",
        text: "The lighthouse glows golden and becomes 60 percent more convincing.",
        choices: [
          { label: "Admire the shine", nextStepId: "end-shine" },
          { label: "Add jam fog", nextStepId: "end-jam" }
        ]
      },
      {
        id: "lost",
        text: "One crumb says it took a wrong turn after the bite incident and prefers not to discuss it.",
        choices: [
          { label: "Respect privacy", nextStepId: "end-privacy" },
          { label: "Offer directions", nextStepId: "end-directions" }
        ]
      },
      {
        id: "end-path",
        text: "The crumbs reach safety near the napkin, where everyone immediately gets sleepy.",
        ending: "Maritime breakfast history is made."
      },
      {
        id: "end-captain",
        text: "Captain Crumb accepts command and stands on a sesame seed like a podium.",
        ending: "Leadership is crunchy."
      },
      {
        id: "end-shine",
        text: "The toast shines modestly, which is hard with butter but it manages.",
        ending: "A quiet beacon remains."
      },
      {
        id: "end-jam",
        text: "Jam fog rolls in. The crumbs become legends almost immediately.",
        ending: "Breakfast grows mythological."
      },
      {
        id: "end-privacy",
        text: "The crumb exhales and stops pretending to be brave for a second.",
        ending: "The plate feels gentler."
      },
      {
        id: "end-directions",
        text: "Your directions are mostly left, then less left. The crumb accepts this as wisdom.",
        ending: "Navigation improves slightly."
      }
    ]
  },
  {
    id: "laundry-portal",
    title: "Laundry Portal",
    scenario:
      "A dryer sheet unfolds into a tiny portal. Through it, you can see a kingdom of static.",
    startStepId: "start",
    steps: [
      {
        id: "start",
        text: "The static kingdom has a flag, a throne, and many socks standing too close to walls.",
        choices: [
          { label: "Wave at the socks", nextStepId: "wave" },
          { label: "Enter with caution", nextStepId: "enter" },
          { label: "Send a lint diplomat", nextStepId: "diplomat" }
        ]
      },
      {
        id: "wave",
        text: "The socks wave back and stick briefly to the castle gate.",
        choices: [
          { label: "Applaud recovery", nextStepId: "end-recovery" },
          { label: "Ask about the king", nextStepId: "end-king" }
        ]
      },
      {
        id: "enter",
        text: "Your hair rises by one official centimeter. The kingdom recognizes your volume.",
        choices: [
          { label: "Bow carefully", nextStepId: "end-bow" },
          { label: "Declare neutrality", nextStepId: "end-neutral" }
        ]
      },
      {
        id: "diplomat",
        text: "The lint diplomat arrives in a puff and immediately becomes popular.",
        choices: [
          { label: "Let it negotiate", nextStepId: "end-negotiate" },
          { label: "Recall it home", nextStepId: "end-recall" }
        ]
      },
      {
        id: "end-recovery",
        text: "The socks peel themselves off with dignity and only a little crackle.",
        ending: "Their morale improves by two sparks."
      },
      {
        id: "end-king",
        text: "The king is a sweater sleeve with a crown-shaped wrinkle.",
        ending: "Monarchy is stranger in the dryer."
      },
      {
        id: "end-bow",
        text: "Bowing generates a tiny shock. Everyone calls it ceremonial.",
        ending: "Tradition begins on the spot."
      },
      {
        id: "end-neutral",
        text: "Neutrality is accepted after you agree not to bring balloons.",
        ending: "A fair treaty."
      },
      {
        id: "end-negotiate",
        text: "The lint diplomat secures open borders for soft fabrics and ambiguous fuzz.",
        ending: "Peace has texture."
      },
      {
        id: "end-recall",
        text: "The lint returns wearing a medal and a suspicious amount of static.",
        ending: "Foreign service changes a fuzz."
      }
    ]
  }
];
