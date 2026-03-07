export interface LabActivity {
  id: string;
  title: string;
  objective: string;
  theory: string;
  unit: number;
  unitName: string;
}

export const labData: Record<string, Record<number, LabActivity[]>> = {
  physics: {
    9: [
      { id: "p9-1", unit: 1, unitName: "Measurement", title: "Measuring Length", objective: "Learn to measure length accurately using rulers and vernier calipers", theory: "Measurement is fundamental to physics. A vernier caliper allows reading to 0.01 cm precision by using a sliding scale alongside the main scale." },
      { id: "p9-2", unit: 2, unitName: "Forces & Motion", title: "Newton's Second Law", objective: "Explore the relationship between force, mass, and acceleration (F = ma)", theory: "Newton's Second Law states that the acceleration of an object is directly proportional to the net force acting on it and inversely proportional to its mass: F = ma." },
      { id: "p9-3", unit: 2, unitName: "Forces & Motion", title: "Pendulum Lab", objective: "Investigate factors affecting the period of a simple pendulum", theory: "The period of a simple pendulum is T = 2π√(L/g), depending on length L and gravitational acceleration g, but independent of mass." },
      { id: "p9-4", unit: 3, unitName: "Waves", title: "Wave Simulation", objective: "Explore properties of transverse waves including frequency, amplitude, and wavelength", theory: "A wave transports energy without transporting matter. The wave equation relates speed, frequency, and wavelength: v = fλ." },
    ],
    10: [
      { id: "p10-1", unit: 1, unitName: "Vectors", title: "Vector Addition Lab", objective: "Learn to add vectors graphically and calculate the resultant vector", theory: "Vectors have both magnitude and direction. The resultant of two vectors can be found using the parallelogram law or component method." },
      { id: "p10-2", unit: 2, unitName: "Kinematics", title: "Acceleration Simulation", objective: "Study uniformly accelerated motion and kinematic equations", theory: "For constant acceleration: v = u + at, s = ut + ½at², v² = u² + 2as. These equations describe motion along a straight line." },
      { id: "p10-3", unit: 3, unitName: "Electricity", title: "Circuit Builder Lab", objective: "Build simple circuits and verify Ohm's Law (V = IR)", theory: "Ohm's Law states that voltage across a conductor is proportional to current through it: V = IR. Resistance is measured in Ohms (Ω)." },
      { id: "p10-4", unit: 4, unitName: "Optics", title: "Reflection & Refraction Lab", objective: "Investigate the laws of reflection and Snell's law of refraction", theory: "The angle of incidence equals the angle of reflection. Snell's Law: n₁sinθ₁ = n₂sinθ₂ governs refraction at interfaces between media." },
    ],
    11: [
      { id: "p11-1", unit: 1, unitName: "Projectile Motion", title: "Projectile Motion", objective: "Analyze projectile trajectories and calculate range and maximum height", theory: "A projectile follows a parabolic path. Range R = v²sin(2θ)/g, Maximum height H = v²sin²(θ)/(2g), Time of flight T = 2vsinθ/g." },
      { id: "p11-2", unit: 1, unitName: "Projectile Motion", title: "Inclined Plane", objective: "Analyze forces on an object on an inclined plane", theory: "On an incline at angle θ, gravity decomposes into: parallel component mgsinθ (along slope) and normal component mgcosθ (perpendicular to slope)." },
      { id: "p11-3", unit: 2, unitName: "Electrostatics", title: "Coulomb's Law", objective: "Explore the electrostatic force between two charged objects", theory: "Coulomb's Law: F = kq₁q₂/r², where k = 8.99 × 10⁹ N·m²/C². Like charges repel, opposite charges attract." },
      { id: "p11-4", unit: 3, unitName: "Heat Transfer", title: "Heat Conduction", objective: "Observe heat transfer through a metal rod by conduction", theory: "Heat conducts through solids by molecular vibration transfer. The rate depends on thermal conductivity, cross-section area, length, and temperature difference." },
    ],
    12: [
      { id: "p12-1", unit: 1, unitName: "Advanced Mechanics", title: "Horizontal & Inclined Projectile", objective: "Compare horizontal and angled projectile motion with optional air resistance", theory: "Horizontal projectiles have zero initial vertical velocity. Time to ground depends only on height: t = √(2h/g). Range = v₀ × t." },
      { id: "p12-2", unit: 2, unitName: "Fluid Mechanics", title: "Fluid Pressure Lab", objective: "Measure pressure at different depths in a fluid column", theory: "Fluid pressure increases with depth: P = P₀ + ρgh, where ρ is fluid density, g is gravitational acceleration, and h is depth." },
      { id: "p12-3", unit: 3, unitName: "Electromagnetism", title: "Magnetic Field Visualization", objective: "Visualize magnetic field lines around a bar magnet and current-carrying conductor", theory: "Magnetic field lines emerge from the north pole and enter the south pole. Field strength decreases with distance from the source." },
      { id: "p12-4", unit: 4, unitName: "Electronics", title: "Diode & Rectifier Lab", objective: "Study the I-V characteristics of a diode and half-wave rectification", theory: "A diode allows current in one direction only. In forward bias above ~0.7V (silicon), current increases exponentially. Rectifiers convert AC to DC." },
    ],
  },
  chemistry: {
    9: [
      { id: "c9-1", unit: 1, unitName: "Lab Safety", title: "Lab Safety & Measurement", objective: "Learn lab safety protocols and basic measurement techniques", theory: "Lab safety includes wearing goggles, proper chemical handling, and knowing emergency procedures. Accurate measurement is the foundation of chemistry." },
      { id: "c9-2", unit: 2, unitName: "Matter", title: "States of Matter", objective: "Observe phase transitions of water by changing temperature", theory: "Matter exists in solid, liquid, and gas states. Water melts at 0°C and boils at 100°C. Molecular motion increases with temperature." },
      { id: "c9-3", unit: 3, unitName: "Atomic Structure", title: "Atomic Structure (Bohr Model)", objective: "Build atomic models by placing protons, neutrons, and electrons", theory: "The Bohr model places electrons in shells: 1st shell holds 2, 2nd holds 8, 3rd holds 18. Atomic number = protons = electrons (neutral atom)." },
      { id: "c9-4", unit: 4, unitName: "Chemical Reactions", title: "Chemical Reactions (Combination)", objective: "Observe a combination reaction: Iron + Sulphur → Iron Sulphide", theory: "In a combination reaction, two or more substances combine to form a single product. Fe + S → FeS is an exothermic reaction." },
      { id: "c9-5", unit: 4, unitName: "Chemical Reactions", title: "Conservation of Mass", objective: "Verify that mass is conserved in a chemical reaction", theory: "The Law of Conservation of Mass states that mass cannot be created or destroyed in a chemical reaction. Total mass of reactants = total mass of products." },
    ],
    10: [
      { id: "c10-1", unit: 1, unitName: "Displacement Reactions", title: "Single Displacement (Fe + CuSO₄)", objective: "Observe iron displacing copper from copper sulphate solution", theory: "In a single displacement reaction, a more reactive metal displaces a less reactive one from solution. Iron is above copper in the reactivity series." },
      { id: "c10-2", unit: 2, unitName: "Solutions", title: "Preparation of Standard Solution", objective: "Learn to prepare a solution of known concentration", theory: "A standard solution has a precisely known concentration. It requires accurate mass measurement and volumetric flask filling to the calibration mark." },
      { id: "c10-3", unit: 3, unitName: "Acid-Base Chemistry", title: "Acid-Base Titration", objective: "Perform a titration to find the concentration of an unknown acid", theory: "Titration involves adding a known concentration base to an acid until neutralization. The endpoint is detected by an indicator color change." },
      { id: "c10-4", unit: 3, unitName: "Acid-Base Chemistry", title: "pH & Indicators", objective: "Measure pH of various solutions using indicators and pH meters", theory: "pH measures hydrogen ion concentration on a 0-14 scale. Acids have pH < 7, bases have pH > 7. Indicators change color at specific pH ranges." },
    ],
    11: [
      { id: "c11-1", unit: 1, unitName: "Atomic Models", title: "Rutherford Gold Foil Experiment", objective: "Simulate alpha particle scattering to discover the nuclear model", theory: "Rutherford fired alpha particles at thin gold foil. Most passed through, some deflected, very few bounced back—proving a small, dense, positive nucleus." },
      { id: "c11-2", unit: 1, unitName: "Atomic Models", title: "Photoelectric Effect", objective: "Investigate how light frequency affects electron emission from a metal", theory: "Electrons are emitted when light frequency exceeds the threshold: KE = hf - φ, where h is Planck's constant and φ is the work function." },
      { id: "c11-3", unit: 2, unitName: "Kinetics & Equilibrium", title: "Reaction Rate (Catalyst)", objective: "Study how catalysts affect reaction rate and activation energy", theory: "Catalysts lower activation energy without being consumed. This increases the fraction of molecules with sufficient energy to react." },
      { id: "c11-4", unit: 2, unitName: "Kinetics & Equilibrium", title: "Le Chatelier's Principle", objective: "Observe how changes in conditions shift chemical equilibrium", theory: "Le Chatelier's Principle: if a system at equilibrium is disturbed, it shifts to partially counteract the change and restore a new equilibrium." },
    ],
    12: [
      { id: "c12-1", unit: 1, unitName: "Acid-Base Equilibria", title: "Weak Acid Ionization (Ka)", objective: "Calculate the ionization constant Ka for a weak acid", theory: "Weak acids partially ionize: HA ⇌ H⁺ + A⁻. Ka = [H⁺][A⁻]/[HA]. The ICE table method tracks concentration changes." },
      { id: "c12-2", unit: 1, unitName: "Acid-Base Equilibria", title: "Buffer Solutions", objective: "Observe how buffer solutions resist pH changes", theory: "Buffers contain a weak acid and its conjugate base. They neutralize added H⁺ or OH⁻, maintaining nearly constant pH within the buffer region." },
      { id: "c12-3", unit: 2, unitName: "Electrochemistry", title: "Voltaic (Galvanic) Cell", objective: "Build a voltaic cell and observe electron flow and voltage generation", theory: "A voltaic cell converts chemical energy to electrical energy. Zn is oxidized (anode), Cu²⁺ is reduced (cathode). Standard cell potential ≈ 1.10V." },
      { id: "c12-4", unit: 3, unitName: "Industrial Chemistry", title: "Haber Process", objective: "Simulate industrial ammonia production and optimize conditions", theory: "N₂ + 3H₂ ⇌ 2NH₃. High pressure and moderate temperature with iron catalyst maximize yield. This is a key industrial equilibrium process." },
    ],
  },
  biology: {
    9: [
      { id: "b9-1", unit: 1, unitName: "Introduction to Biology", title: "Microscope Simulation", objective: "Learn to properly use a microscope and observe objects", theory: "A compound microscope uses two lens systems. Total magnification = eyepiece (10×) × objective lens. Proper focusing starts with the lowest power objective." },
      { id: "b9-2", unit: 1, unitName: "Introduction to Biology", title: "Seed Germination Lab", objective: "Investigate factors affecting seed germination", theory: "Seeds need water, warmth, and air to germinate. The embryo breaks through the seed coat when conditions are suitable for growth." },
      { id: "b9-3", unit: 2, unitName: "Classification & Taxonomy", title: "Dichotomous Key Lab", objective: "Identify organisms using a dichotomous key", theory: "A dichotomous key uses pairs of contrasting characteristics to identify organisms step by step, narrowing choices until an identification is reached." },
      { id: "b9-4", unit: 3, unitName: "Cells", title: "Onion Cell Observation", objective: "Observe plant cells under a microscope and label parts", theory: "Plant cells have a cell wall, cell membrane, cytoplasm, nucleus, and large vacuole. Onion epidermal cells are ideal for viewing under a microscope." },
      { id: "b9-5", unit: 3, unitName: "Cells", title: "Osmosis Experiment", objective: "Demonstrate osmosis using potato strips", theory: "Osmosis is the movement of water molecules from a dilute solution to a concentrated solution through a semi-permeable membrane." },
      { id: "b9-6", unit: 5, unitName: "Food & Nutrition", title: "Starch Test (Iodine)", objective: "Test the presence of starch in food samples", theory: "Iodine solution turns blue-black in the presence of starch. This is because iodine molecules fit inside the coiled structure of amylose in starch." },
      { id: "b9-7", unit: 5, unitName: "Food & Nutrition", title: "Protein Test (Biuret)", objective: "Test the presence of protein in food samples", theory: "Biuret reagent turns from blue to purple/violet in the presence of peptide bonds found in proteins. The Cu²⁺ ions form a complex with the peptide bonds." },
      { id: "b9-8", unit: 6, unitName: "Ecology", title: "Food Chain Builder", objective: "Understand feeding relationships in ecosystems", theory: "A food chain shows the flow of energy from producers to consumers. Arrows point in the direction of energy flow. Removing one link affects the entire chain." },
    ],
    10: [
      { id: "b10-1", unit: 1, unitName: "Transport in Plants", title: "Osmosis Simulation", objective: "Observe osmosis across a semi-permeable membrane", theory: "Osmosis is the movement of water from a region of low solute concentration to high solute concentration across a semi-permeable membrane." },
      { id: "b10-2", unit: 1, unitName: "Transport in Plants", title: "Transpiration Simulation", objective: "Investigate factors affecting water loss in plants", theory: "Transpiration is evaporation of water from leaf stomata. Rate increases with wind speed, temperature, and light intensity, and decreases with humidity." },
      { id: "b10-3", unit: 2, unitName: "Reproduction", title: "Virtual Flower Dissection", objective: "Identify and label the parts of a flower", theory: "Flowers have sepals (protection), petals (attract pollinators), stamens (male: anther + filament), and pistil (female: stigma + style + ovary)." },
      { id: "b10-4", unit: 3, unitName: "Human Biology", title: "Heart Pumping Simulation", objective: "Observe the cardiac cycle and blood flow through the heart", theory: "The heart has 4 chambers. Right side pumps deoxygenated blood to lungs, left side pumps oxygenated blood to body. Valves prevent backflow." },
    ],
    11: [
      { id: "b11-1", unit: 1, unitName: "Biochemistry", title: "Enzyme Activity", objective: "Investigate how temperature and pH affect enzyme reaction rates", theory: "Enzymes are biological catalysts with optimal temperature and pH. Beyond optimal conditions, enzymes denature and activity drops sharply." },
      { id: "b11-2", unit: 1, unitName: "Biochemistry", title: "Photosynthesis", objective: "Measure the rate of photosynthesis under varying conditions", theory: "6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂. Rate depends on light intensity, CO₂ concentration, and temperature. Oxygen bubbles indicate reaction rate." },
      { id: "b11-3", unit: 2, unitName: "Histology", title: "Human Tissues (Histology)", objective: "Identify different human tissue types under microscopy", theory: "Four main tissue types: epithelial (covering), connective (support), muscle (movement), and nervous (signaling). Each has distinct cellular characteristics." },
      { id: "b11-4", unit: 3, unitName: "Genetics", title: "Monohybrid Cross (Punnett Square)", objective: "Predict offspring ratios using a Punnett Square", theory: "A monohybrid cross examines one gene. Heterozygous cross (Aa × Aa) yields 1:2:1 genotypic ratio and 3:1 phenotypic ratio (with complete dominance)." },
    ],
    12: [
      { id: "b12-1", unit: 1, unitName: "Molecular Biology", title: "Bacterial Transformation", objective: "Simulate gene insertion into bacteria using plasmid vectors", theory: "Bacterial transformation inserts foreign DNA via plasmids. Steps: cut plasmid with restriction enzyme, insert gene, ligate, transform bacteria, select." },
      { id: "b12-2", unit: 2, unitName: "Evolution", title: "Natural Selection Simulator", objective: "Observe how environmental pressures drive evolution over generations", theory: "Natural selection favors organisms with traits suited to their environment. Over generations, allele frequencies shift, driving evolution." },
      { id: "b12-3", unit: 3, unitName: "Nervous System", title: "Reflex Arc & Synapse", objective: "Trace a nerve impulse along a reflex arc and across a synapse", theory: "A reflex arc: stimulus → receptor → sensory neuron → interneuron → motor neuron → effector. Synapses transmit signals via neurotransmitters." },
      { id: "b12-4", unit: 4, unitName: "Reproductive System", title: "Hormone Cycle (Menstrual Cycle)", objective: "Track hormone levels and ovarian changes through the 28-day cycle", theory: "FSH stimulates follicle growth, estrogen thickens the uterine lining, LH triggers ovulation, progesterone maintains the lining. Day 14 = ovulation." },
    ],
  },
};

// Helper to get unique units from labs
export function getUnits(labs: LabActivity[]): { unit: number; unitName: string }[] {
  const seen = new Set<number>();
  return labs.filter(l => {
    if (seen.has(l.unit)) return false;
    seen.add(l.unit);
    return true;
  }).map(l => ({ unit: l.unit, unitName: l.unitName }));
}

export const subjectMeta: Record<string, { name: string; color: string }> = {
  physics: { name: "Physics", color: "text-blue-400" },
  chemistry: { name: "Chemistry", color: "text-emerald-400" },
  biology: { name: "Biology", color: "text-rose-400" },
};
