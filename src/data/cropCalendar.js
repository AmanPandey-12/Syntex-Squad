export const cropCalendarData = [
  {
    season: "Kharif",
    period: "June - October",
    type: "Monsoon Season",
    color: "emerald",
    description: "High moisture and temperature requirement. Vital for staple food production.",
    crops: [
      { name: "Rice (Paddy)", sow: "June - July", harvest: "Nov - Dec", details: "Requires high humidity and rainfall (150-300cm)." },
      { name: "Maize (Corn)", sow: "June - July", harvest: "Sept - Oct", details: "Well-drained fertile soil with moderate rainfall." },
      { name: "Cotton", sow: "May - June", harvest: "Oct - Dec", details: "Requires high temperature and bright sunshine." },
      { name: "Soybean", sow: "June - July", harvest: "Oct - Nov", details: "Nitrogen-fixing crop, excellent for soil health." },
      { name: "Bajra", sow: "June - July", harvest: "Oct - Nov", details: "Drought resistant, thrives in sandy soils." }
    ]
  },
  {
    season: "Rabi",
    period: "November - April",
    type: "Winter Season",
    color: "sky",
    description: "Cooler temperatures and controlled irrigation. Best for wheat and mustard.",
    crops: [
      { name: "Wheat", sow: "Oct - Nov", harvest: "March - April", details: "Requires cool growing season and bright sunshine at ripening." },
      { name: "Mustard", sow: "Oct - Nov", harvest: "Feb - March", details: "Low water requirement, sensitive to frost." },
      { name: "Chickpea (Gram)", sow: "Oct - Nov", harvest: "Feb - April", details: "Grows well on loamy soil with minimal irrigation." },
      { name: "Potato", sow: "Oct - Nov", harvest: "Jan - March", details: "Prefers well-drained loamy soil, cool climate." },
      { name: "Barley", sow: "Oct - Dec", harvest: "March - May", details: "Grown as a substitute for wheat in dry areas." }
    ]
  },
  {
    season: "Zaid",
    period: "March - June",
    type: "Summer Transition",
    color: "amber",
    description: "Short duration crops between Rabi and Kharif. High heat tolerance.",
    crops: [
      { name: "Watermelon", sow: "Feb - March", harvest: "May - June", details: "Grows best in sandy river beds with high heat." },
      { name: "Cucumber", sow: "Feb - March", harvest: "April - June", details: "Fast growing, requires constant trellis support." },
      { name: "Muskmelon", sow: "Feb - March", harvest: "May - June", details: "Requires dry environment during fruit ripening." },
      { name: "Bitter Gourd", sow: "Feb - March", harvest: "May - Aug", details: "Highly medicinal, vertical farming favorite." },
      { name: "Moong Dal", sow: "March - April", harvest: "May - June", details: "Quick protein source, excellent short-term investment." }
    ]
  }
];
