// Rain Window — the secret fourth room. Two people sharing a window,
// watching rain. Lines are spare. Lots of silence between them.

export type RainConversation = {
  id: string;
  lines: { speaker: "rin" | "hal"; text: string }[];
};

export const rainConversations: RainConversation[] = [
  {
    id: "still-light",
    lines: [
      { speaker: "hal", text: "it's coming down." },
      { speaker: "rin", text: "still light." },
      { speaker: "hal", text: "more of a mist, really." },
      { speaker: "rin", text: "it'll get there." }
    ]
  },
  {
    id: "the-one-on-the-glass",
    lines: [
      { speaker: "rin", text: "that one's going to win." },
      { speaker: "hal", text: "which one." },
      { speaker: "rin", text: "the slow one. left side." },
      { speaker: "hal", text: "huh." },
      { speaker: "hal", text: "you're right." }
    ]
  },
  {
    id: "the-paper",
    lines: [
      { speaker: "hal", text: "i should bring the paper in." },
      { speaker: "rin", text: "it's already done." },
      { speaker: "hal", text: "fair." }
    ]
  },
  {
    id: "did-you-hear",
    lines: [
      { speaker: "rin", text: "did you hear that?" },
      { speaker: "hal", text: "no." },
      { speaker: "rin", text: "exactly." }
    ]
  },
  {
    id: "kettle",
    lines: [
      { speaker: "hal", text: "kettle?" },
      { speaker: "rin", text: "in a minute." },
      { speaker: "rin", text: "i'm watching this one." }
    ]
  },
  {
    id: "tomorrow",
    lines: [
      { speaker: "rin", text: "they said clear tomorrow." },
      { speaker: "hal", text: "they always say that." },
      { speaker: "rin", text: "they do." },
      { speaker: "hal", text: "i don't mind, though." }
    ]
  },
  {
    id: "the-bird",
    lines: [
      { speaker: "hal", text: "there's a bird under the awning." },
      { speaker: "rin", text: "waiting it out." },
      { speaker: "hal", text: "smart bird." }
    ]
  },
  {
    id: "warm-inside",
    lines: [
      { speaker: "rin", text: "i love this." },
      { speaker: "hal", text: "the rain?" },
      { speaker: "rin", text: "the being inside while it's outside." }
    ]
  }
];
