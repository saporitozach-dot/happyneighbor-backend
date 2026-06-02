const TEMPLATES = {
  summer: {
    title: "Summer Block Party",
    type: "party",
    description:
      "Bring a side or drinks to share. We will have music, games for kids, and plenty of time to meet neighbors you have not talked to yet.",
    fundingDescription: "Drinks, ice, and basic supplies for everyone",
    fundingPerGuest: 4,
    pizzaItemName: "Party Pack (3 Large Pizzas)",
  },
  holiday: {
    title: "Holiday Block Gathering",
    type: "party",
    description:
      "Hot cocoa, simple treats, and time to catch up before the holidays get busy. All ages welcome.",
    fundingDescription: "Cocoa, cups, and holiday decorations",
    fundingPerGuest: 3,
    pizzaItemName: "Large Pepperoni Pizza",
  },
  night_out: {
    title: "National Night Out Block Meetup",
    type: "party",
    description:
      "Meet at the usual spot on the block. Short program, introductions for new families, and food on the curb.",
    fundingDescription: "Name tags, snacks, and shared tables",
    fundingPerGuest: 3,
    pizzaItemName: "Party Pack (3 Large Pizzas)",
  },
  cookout: {
    title: "Neighborhood Cookout",
    type: "party",
    description:
      "Grills welcome. We will coordinate who brings mains, sides, and drinks so nothing overlaps.",
    fundingDescription: "Shared ice, plates, and extras",
    fundingPerGuest: 5,
    pizzaItemName: "Large Cheese Pizza",
  },
};

function suggestDate(templateKey) {
  const d = new Date();
  if (templateKey === "summer") {
    d.setMonth(6);
    d.setDate(15);
  } else if (templateKey === "holiday") {
    d.setMonth(11);
    d.setDate(10);
  } else {
    d.setDate(d.getDate() + 21);
  }
  if (d < new Date()) d.setFullYear(d.getFullYear() + 1);
  return d.toISOString().slice(0, 10);
}

export function generatePartyPlan({ templateKey, guests, date, time, streetName }) {
  const template = TEMPLATES[templateKey] || TEMPLATES.summer;
  const guestCount = Math.max(8, parseInt(guests, 10) || 24);
  const eventDate = date || suggestDate(templateKey);
  const eventTime = time || "16:00";
  const fundingGoal = Math.round(guestCount * template.fundingPerGuest);

  const smsMessage =
    `Hi neighbor! ${streetName || "Your block"} is planning a ${template.title} on ${eventDate} at ${eventTime.slice(0, 5).replace(":", ":")}. ` +
    `RSVP and chip in on BlockParty. Hope to see you there!`;

  return {
    title: `${template.title} 🎉`,
    date: eventDate,
    time: eventTime,
    type: template.type,
    description: template.description,
    needsFunding: true,
    fundingGoal: String(fundingGoal),
    fundingDescription: template.fundingDescription,
    suggestedGuests: guestCount,
    recommendedPizza: template.pizzaItemName,
    notifyMessage: smsMessage,
    checklist: [
      "Pick a rain date and post it in the event",
      "Ask two neighbors to help with setup",
      "Enable chip-in so supplies are covered",
      `Order pizza: ${template.pizzaItemName} for about ${guestCount} people`,
      "Send the text invite to neighbors who have not joined the app yet",
    ],
  };
}

export const PARTY_TEMPLATES = [
  { key: "summer", label: "Summer block party", icon: "☀️" },
  { key: "cookout", label: "Neighborhood cookout", icon: "🍔" },
  { key: "night_out", label: "National Night Out", icon: "🏘️" },
  { key: "holiday", label: "Holiday gathering", icon: "🎄" },
];
