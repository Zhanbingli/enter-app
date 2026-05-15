// Special-moment overrides. Most opens fall through to the time band, but a
// handful of specific moments (11:11, the minute around midnight, Friday
// evening, the long Sunday afternoon) get their own one-line acknowledgement.
//
// Kept deliberately small. The point is that someone who happens to open the
// app at 11:11 notices, screenshots, sends it to a friend.

export type Moment = {
  id: string;
  opener: string;
};

function isElevenEleven(date: Date): boolean {
  const m = date.getMinutes();
  return (date.getHours() === 11 || date.getHours() === 23) && m === 11;
}

function isAroundMidnight(date: Date): boolean {
  const h = date.getHours();
  const m = date.getMinutes();
  return (h === 23 && m >= 58) || (h === 0 && m <= 2);
}

function isFridayEvening(date: Date): boolean {
  return date.getDay() === 5 && date.getHours() >= 18 && date.getHours() < 23;
}

function isSundayAfternoon(date: Date): boolean {
  return date.getDay() === 0 && date.getHours() >= 13 && date.getHours() < 17;
}

export function getCurrentMoment(date = new Date()): Moment | null {
  if (isAroundMidnight(date)) {
    return { id: "midnight", opener: "tomorrow, almost." };
  }
  if (isElevenEleven(date)) {
    return { id: "eleven-eleven", opener: "11:11, somewhere." };
  }
  if (isFridayEvening(date)) {
    return { id: "friday-evening", opener: "it's friday, somewhere." };
  }
  if (isSundayAfternoon(date)) {
    return { id: "sunday-afternoon", opener: "the long sunday." };
  }
  return null;
}
