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
  },
  {
    id: "microwave-dispute",
    title: "Microwave Dispute",
    scenario:
      "Your microwave has filed a small grievance. It says it is tired of being asked to thaw frozen things in three minutes.",
    startStepId: "start",
    steps: [
      {
        id: "start",
        text: "It has typed up a list. The list is mostly correct. It is also mildly unionized.",
        choices: [
          { label: "Read the list out loud", nextStepId: "read" },
          { label: "Apologize sincerely", nextStepId: "apology" },
          { label: "Offer to thaw something gently", nextStepId: "gentle" }
        ]
      },
      {
        id: "read",
        text: "Item one: no more burritos before noon. Item two: eye contact would be appreciated.",
        choices: [
          { label: "Agree to the noon clause", nextStepId: "end-noon" },
          { label: "Promise eye contact", nextStepId: "end-eyes" }
        ]
      },
      {
        id: "apology",
        text: "The microwave seems unmoved. Apologies should be reheated to be absorbed properly. It mentions this several times.",
        choices: [
          { label: "Reheat the apology", nextStepId: "end-reheat" },
          { label: "Write a small card instead", nextStepId: "end-card" }
        ]
      },
      {
        id: "gentle",
        text: "You hold up a stick of butter and ask kindly. The microwave hums. This is a yes, but it wants documentation.",
        choices: [
          { label: "Sign the documentation", nextStepId: "end-sign" },
          { label: "Add a stamp for ceremony", nextStepId: "end-stamp" }
        ]
      },
      {
        id: "end-noon",
        text: "The clause is added to the unwritten kitchen contract. It glows briefly.",
        ending: "Burritos will only happen after the sun has stretched."
      },
      {
        id: "end-eyes",
        text: "You make eye contact for the entire next defrost cycle. The microwave seems flattered.",
        ending: "It blushes in a frequency only fridges can hear."
      },
      {
        id: "end-reheat",
        text: "You reheat the apology for thirty seconds. It comes out warmer and more believable.",
        ending: "The microwave keeps it on file for emergencies."
      },
      {
        id: "end-card",
        text: "The card is small and includes a drawing of a soft potato. The microwave tapes it to its inside.",
        ending: "Future thawings happen with slightly more dignity."
      },
      {
        id: "end-sign",
        text: "The documentation is brief and somewhat made up. The microwave files it carefully.",
        ending: "You are now compliant with appliance protocol you do not understand."
      },
      {
        id: "end-stamp",
        text: "There was no stamp, so you used a thumbprint and a meaningful look.",
        ending: "The kitchen accepts this as official."
      }
    ]
  },
  {
    id: "library-314",
    title: "Library at 3:14",
    scenario:
      "A tiny library has appeared between two of your bookshelves. It opens only at 3:14, which is now.",
    startStepId: "start",
    steps: [
      {
        id: "start",
        text: "There is a librarian. The librarian is approximately two inches tall and looks experienced.",
        choices: [
          { label: "Ask for a recommendation", nextStepId: "rec" },
          { label: "Look at the catalog", nextStepId: "catalog" },
          { label: "Pretend you did not see anything", nextStepId: "pretend" }
        ]
      },
      {
        id: "rec",
        text: "The librarian thinks for a long time, then suggests something called 'Quiet Things About Pigeons'.",
        choices: [
          { label: "Borrow it", nextStepId: "end-borrow" },
          { label: "Ask if there is a sequel", nextStepId: "end-sequel" }
        ]
      },
      {
        id: "catalog",
        text: "The catalog is a folded receipt. Most of the books are titled with single feelings.",
        choices: [
          { label: "Pick 'small embarrassments'", nextStepId: "end-embarrass" },
          { label: "Pick 'mild relief'", nextStepId: "end-relief" }
        ]
      },
      {
        id: "pretend",
        text: "You make eye contact with the wall. The librarian respects the choice and continues stamping things.",
        choices: [
          { label: "Apologize quietly", nextStepId: "end-apology" },
          { label: "Walk away with dignity", nextStepId: "end-dignity" }
        ]
      },
      {
        id: "end-borrow",
        text: "The book is shorter than your thumb. You will read it during a quiet bus ride.",
        ending: "It turns out to be mostly about waiting, which is also pigeon-related."
      },
      {
        id: "end-sequel",
        text: "There is one. It is called 'Pigeons That Have Reconsidered'. It has been on hold for decades.",
        ending: "You join the waitlist with no real expectations."
      },
      {
        id: "end-embarrass",
        text: "It is a thin pamphlet. It begins with a story about almost waving at a stranger.",
        ending: "You feel seen, but tastefully so."
      },
      {
        id: "end-relief",
        text: "The book is mostly empty pages with one sentence: 'oh, that one was fine.'",
        ending: "It was the right pick. You feel slightly better about Tuesday."
      },
      {
        id: "end-apology",
        text: "You whisper sorry to the wall. The librarian nods. Apologies count even when misdirected.",
        ending: "The library closes at 3:15. You hear a tiny bell."
      },
      {
        id: "end-dignity",
        text: "You walk away with the kind of dignity that comes from refusing to engage with whatever just happened.",
        ending: "The shelves return to normal width by morning."
      }
    ]
  },
  {
    id: "pillow-promotion",
    title: "Pillow Promotion",
    scenario:
      "Your pillow says it has been promoted at the dream factory. It is not entirely sure what that means.",
    startStepId: "start",
    steps: [
      {
        id: "start",
        text: "It has a small certificate. The certificate is suspiciously soft. It also smells like fabric softener.",
        choices: [
          { label: "Congratulate it", nextStepId: "congrats" },
          { label: "Ask what the new role involves", nextStepId: "role" },
          { label: "Throw a tiny ceremony", nextStepId: "ceremony" }
        ]
      },
      {
        id: "congrats",
        text: "The pillow accepts your handshake. It now believes management is hands on.",
        choices: [
          { label: "Promise a raise in fluff", nextStepId: "end-fluff" },
          { label: "Take a photo for the records", nextStepId: "end-photo" }
        ]
      },
      {
        id: "role",
        text: "The new role apparently involves overseeing dreams about staircases. There are many staircases in a life.",
        choices: [
          { label: "Wish it luck", nextStepId: "end-luck" },
          { label: "Volunteer to help", nextStepId: "end-help" }
        ]
      },
      {
        id: "ceremony",
        text: "You arrange three socks in a semicircle. The pillow stands at the center. The socks do not move.",
        choices: [
          { label: "Make a short speech", nextStepId: "end-speech" },
          { label: "Adjourn to bed", nextStepId: "end-bed" }
        ]
      },
      {
        id: "end-fluff",
        text: "The raise is implemented immediately. You fluff the pillow with both hands. It becomes briefly emotional.",
        ending: "Management has never been this kind."
      },
      {
        id: "end-photo",
        text: "The photo is blurry but historical. You will keep it on the bed forever.",
        ending: "The pillow now has a documented career."
      },
      {
        id: "end-luck",
        text: "The pillow acknowledges your support. It says staircases are a personal interest.",
        ending: "Tonight you will dream of one good banister."
      },
      {
        id: "end-help",
        text: "You promise to dream about elevators instead, to make the workload lighter.",
        ending: "This counts as professional cooperation."
      },
      {
        id: "end-speech",
        text: "Your speech is brief. It mentions softness, loyalty, and one good night in 2019.",
        ending: "The socks did not applaud, but they did not leave."
      },
      {
        id: "end-bed",
        text: "Everyone agrees the ceremony was meaningful but should now end.",
        ending: "Sleep is, technically, the best benefit."
      }
    ]
  },
  {
    id: "sock-hazard-pay",
    title: "Sock Hazard Pay",
    scenario:
      "One sock has returned after months of absence. It is requesting hazard pay for its time in the wider world.",
    startStepId: "start",
    steps: [
      {
        id: "start",
        text: "The sock has dust in its weave and a slightly haunted look. It refuses to comment on where it has been.",
        choices: [
          { label: "Take its claim seriously", nextStepId: "serious" },
          { label: "Ask for proof", nextStepId: "proof" },
          { label: "Reunite it with its pair", nextStepId: "reunite" }
        ]
      },
      {
        id: "serious",
        text: "You sit at the table and listen. The sock describes a place it calls 'behind'. You cannot tell if it means a couch or something larger.",
        choices: [
          { label: "Offer one sticker as compensation", nextStepId: "end-sticker" },
          { label: "Promise to never lose it again", nextStepId: "end-promise" }
        ]
      },
      {
        id: "proof",
        text: "The sock produces a small piece of lint shaped like a continent. This is not nothing.",
        choices: [
          { label: "Accept the lint as evidence", nextStepId: "end-lint" },
          { label: "File the lint formally", nextStepId: "end-file" }
        ]
      },
      {
        id: "reunite",
        text: "Its pair is in the drawer, looking calm. The reunion is short and slightly awkward.",
        choices: [
          { label: "Leave them to talk", nextStepId: "end-talk" },
          { label: "Move the drawer for privacy", nextStepId: "end-privacy" }
        ]
      },
      {
        id: "end-sticker",
        text: "The sticker is round and gold. The sock places it on its toe with great seriousness.",
        ending: "It will wear it forever, even into the wash."
      },
      {
        id: "end-promise",
        text: "You make a quiet promise into the sock's general direction. It accepts.",
        ending: "Promises to socks are unenforceable but sincere."
      },
      {
        id: "end-lint",
        text: "The lint is preserved in a small envelope marked 'evidence'. The sock seems satisfied.",
        ending: "Bureaucracy has, for once, helped."
      },
      {
        id: "end-file",
        text: "The file is filed. No one will read it. The sock prefers it that way.",
        ending: "The drawer feels marginally more official."
      },
      {
        id: "end-talk",
        text: "You leave the room. There is a low murmur from the drawer for a few minutes.",
        ending: "Whatever they discussed, they came out matched."
      },
      {
        id: "end-privacy",
        text: "You move the drawer two inches and feel oddly considerate.",
        ending: "The socks issued a joint thank you note made entirely of lint."
      }
    ]
  },
  {
    id: "tea-opinion",
    title: "Tea, but Slightly Wrong",
    scenario:
      "You went to make tea, but the kettle has been replaced overnight by a confident opinion.",
    startStepId: "start",
    steps: [
      {
        id: "start",
        text: "The opinion has the same shape and color as the kettle, but instead of steam it produces ideas.",
        choices: [
          { label: "Ask what the opinion is", nextStepId: "ask" },
          { label: "Try to make tea anyway", nextStepId: "tea" },
          { label: "Look for the original kettle", nextStepId: "search" }
        ]
      },
      {
        id: "ask",
        text: "The opinion says: rooms should rest on weekends, including yours. It says this with a slight whistle.",
        choices: [
          { label: "Agree out of politeness", nextStepId: "end-agree" },
          { label: "Disagree with affection", nextStepId: "end-disagree" }
        ]
      },
      {
        id: "tea",
        text: "You pour water into the opinion. The water absorbs an attitude and becomes thoughtful.",
        choices: [
          { label: "Drink it slowly", nextStepId: "end-thoughtful" },
          { label: "Pour it back", nextStepId: "end-pour-back" }
        ]
      },
      {
        id: "search",
        text: "You find the original kettle in the cabinet, hiding politely behind a colander. It looks tired.",
        choices: [
          { label: "Let it rest", nextStepId: "end-rest" },
          { label: "Bring it back to duty", nextStepId: "end-duty" }
        ]
      },
      {
        id: "end-agree",
        text: "The opinion is briefly satisfied. You enjoy a fictional cup of tea.",
        ending: "The room takes a small unannounced break."
      },
      {
        id: "end-disagree",
        text: "Your disagreement is gentle but firm. The opinion appreciates the dialogue and softens slightly.",
        ending: "Future opinions will be smaller and more reasonable."
      },
      {
        id: "end-thoughtful",
        text: "The water is warm and slightly philosophical. You feel ten percent more patient.",
        ending: "You consider keeping the opinion full time."
      },
      {
        id: "end-pour-back",
        text: "You return the water. The opinion absorbs it and becomes briefly humble.",
        ending: "Humble opinions make the best background noise."
      },
      {
        id: "end-rest",
        text: "You make the kettle a tiny blanket from a napkin and let it sit.",
        ending: "Tonight you will drink water from a glass like a serious adult."
      },
      {
        id: "end-duty",
        text: "The kettle returns to work, slightly grateful, slightly resentful. It boils as ceremony.",
        ending: "The opinion is reassigned to the toaster, which has needed structure."
      }
    ]
  },
  {
    id: "crow-audit",
    title: "Tax Audit by a Crow",
    scenario:
      "A crow on your windowsill has questions about your spending this month. It is holding a small clipboard.",
    startStepId: "start",
    steps: [
      {
        id: "start",
        text: "The clipboard contains a list. Your name is at the top, in handwriting that is somehow both elegant and judgmental.",
        choices: [
          { label: "Cooperate fully", nextStepId: "cooperate" },
          { label: "Challenge its authority", nextStepId: "challenge" },
          { label: "Offer it a small bribe", nextStepId: "bribe" }
        ]
      },
      {
        id: "cooperate",
        text: "The crow asks why you bought four kinds of tea. You explain that all four were necessary. It nods slowly.",
        choices: [
          { label: "Defend the third tea", nextStepId: "end-third" },
          { label: "Concede on the fourth", nextStepId: "end-concede" }
        ]
      },
      {
        id: "challenge",
        text: "You ask the crow what jurisdiction it represents. It tilts its head, which legally counts as a citation.",
        choices: [
          { label: "Apologize and proceed", nextStepId: "end-apologize" },
          { label: "Continue with dignity", nextStepId: "end-dignity-crow" }
        ]
      },
      {
        id: "bribe",
        text: "You offer half a cracker. The crow examines it from multiple angles before pocketing it in a way you cannot quite see.",
        choices: [
          { label: "Add a piece of foil", nextStepId: "end-foil" },
          { label: "Stop while you are ahead", nextStepId: "end-stop" }
        ]
      },
      {
        id: "end-third",
        text: "Your defense of the third tea is moving. The crow notes it was a brave purchase.",
        ending: "It marks the audit closed with a small pencil."
      },
      {
        id: "end-concede",
        text: "You admit the fourth tea was excessive. The crow is gracious.",
        ending: "It says forgiveness is part of its training."
      },
      {
        id: "end-apologize",
        text: "Your apology is sincere. The crow accepts and provides verbal absolution.",
        ending: "The receipt floats away on the breeze."
      },
      {
        id: "end-dignity-crow",
        text: "You continue answering questions while standing slightly straighter. It changes nothing but feels right.",
        ending: "The audit will be reviewed by a higher crow next year."
      },
      {
        id: "end-foil",
        text: "The foil seals the deal. The crow performs a small approving hop.",
        ending: "You are cleared. The cracker was the legal one. The foil was friendship."
      },
      {
        id: "end-stop",
        text: "You decide not to overdo it. The crow respects this.",
        ending: "Negotiations end on a quiet, professional note."
      }
    ]
  }
];
