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
      // UNIT 2: Physical Quantities (Measurement)
      { id: "p9-1", unit: 2, unitName: "Physical Quantities", title: "Measuring Length & Area", objective: "Measure the length and width of an object and calculate its area", theory: "Measurement precision depends on the instrument. Rulers: 0.1 cm, Vernier: 0.01 cm, Micrometer: 0.001 cm. Area = Length × Width." },
      { id: "p9-2", unit: 2, unitName: "Physical Quantities", title: "Beam Balance (Mass)", objective: "Measure the mass of objects using a beam balance", theory: "A beam balance compares an unknown mass with standard masses. When balanced, the unknown mass equals the sum of standard masses." },
      { id: "p9-3", unit: 2, unitName: "Physical Quantities", title: "Time Measurement", objective: "Measure time using a stopwatch and calculate average from multiple trials", theory: "Time = Distance / Speed. Repeated trials reduce random error. The average of multiple readings is more reliable." },
      // UNIT 3: Motion in Straight Line
      { id: "p9-4", unit: 3, unitName: "Motion", title: "Distance vs Displacement", objective: "Distinguish between distance (scalar) and displacement (vector)", theory: "Distance is the total path length traveled (scalar). Displacement is the straight-line vector from start to finish." },
      { id: "p9-5", unit: 3, unitName: "Motion", title: "Graphical Motion Analysis", objective: "Plot and interpret position-time and velocity-time graphs", theory: "Slope of x-t graph = velocity. Slope of v-t graph = acceleration. Area under v-t graph = displacement." },
      // UNIT 4: Force, Work & Energy
      { id: "p9-6", unit: 4, unitName: "Force & Energy", title: "Newton's Second Law (F = ma)", objective: "Observe how force affects motion and verify F = ma", theory: "Newton's Second Law: F_net = ma. Acceleration is proportional to net force and inversely proportional to mass." },
      { id: "p9-7", unit: 4, unitName: "Force & Energy", title: "Work & Energy Transformation", objective: "Observe conversion between potential and kinetic energy", theory: "PE = mgh. When an object falls, PE converts to KE. Work done = Force × Distance = mgh. Total energy is conserved." },
      { id: "p9-8", unit: 4, unitName: "Force & Energy", title: "Hooke's Law (Spring)", objective: "Verify Hooke's Law by measuring spring extension vs applied force", theory: "Hooke's Law: F = kx. The extension is proportional to force in the elastic region. k is the spring constant." },
      // UNIT 5: Simple Machines
      { id: "p9-9", unit: 5, unitName: "Simple Machines", title: "Lever Lab", objective: "Explore mechanical advantage of a lever and verify the principle of moments", theory: "For a balanced lever: Effort × Effort Arm = Load × Load Arm. MA = Load / Effort." },
      { id: "p9-10", unit: 5, unitName: "Simple Machines", title: "Inclined Plane", objective: "Analyze forces on an inclined plane and calculate efficiency", theory: "On a ramp: Parallel force = mgsinθ, Normal = mgcosθ. The inclined plane reduces effort at the cost of distance." },
      // UNIT 6: Oscillation & Waves
      { id: "p9-11", unit: 6, unitName: "Oscillation & Waves", title: "Simple Pendulum", objective: "Determine acceleration due to gravity using T = 2π√(L/g)", theory: "Period depends on length and gravity, not mass. T = 2π√(L/g)." },
      { id: "p9-12", unit: 6, unitName: "Oscillation & Waves", title: "Wave Simulation", objective: "Explore transverse wave properties: v = fλ", theory: "A wave transports energy without transporting matter. Speed = frequency × wavelength." },
      // UNIT 7: Temperature & Thermometry
      { id: "p9-13", unit: 7, unitName: "Temperature", title: "Thermal Expansion", objective: "Observe how temperature affects the length of a metal rod", theory: "Linear expansion: ΔL = L₀αΔT. Different materials expand at different rates due to varying coefficients of linear expansion." },
      { id: "p9-14", unit: 7, unitName: "Temperature", title: "Measuring Temperature", objective: "Measure temperature of water samples using a thermometer", theory: "Temperature measures average kinetic energy of molecules. Celsius scale: 0°C (freezing) and 100°C (boiling) for water." },
    ],
    10: [
      // UNIT 1: Vector Quantities
      { id: "p10-1", unit: 1, unitName: "Vector Quantities", title: "Vector Addition (Triangle Method)", objective: "Determine the resultant of two vectors using the triangle and parallelogram methods", theory: "Vectors add by components: Rx = Ax+Bx, Ry = Ay+By. The triangle method places vectors head-to-tail to find the resultant." },
      { id: "p10-2", unit: 1, unitName: "Vector Quantities", title: "Vector Resolution", objective: "Resolve a vector into its horizontal and vertical components", theory: "Any vector can be resolved into components: Ax = A cosθ (horizontal), Ay = A sinθ (vertical). The original vector is the hypotenuse." },
      // UNIT 2: Uniformly Accelerated Motion
      { id: "p10-3", unit: 2, unitName: "Uniformly Accelerated Motion", title: "Distance vs Displacement", objective: "Distinguish between distance and displacement", theory: "Distance is the total path length traveled (scalar). Displacement is the shortest straight-line distance from start to finish (vector)." },
      { id: "p10-4", unit: 2, unitName: "Uniformly Accelerated Motion", title: "Uniform Acceleration", objective: "Observe motion with constant acceleration and verify kinematic equations", theory: "For constant acceleration: v = u + at, s = ut + ½at², v² = u² + 2as. Position–time graphs are parabolic; velocity–time graphs are linear." },
      // UNIT 3: Elasticity & Equilibrium
      { id: "p10-5", unit: 3, unitName: "Elasticity & Equilibrium", title: "Stress–Strain Experiment", objective: "Determine the relationship between stress and strain for different materials", theory: "Stress = Force/Area, Strain = Extension/Length. In the elastic region, Stress = E × Strain (Hooke's Law). Young's modulus E characterizes material stiffness." },
      { id: "p10-6", unit: 3, unitName: "Elasticity & Equilibrium", title: "Torque & Equilibrium", objective: "Verify the principle of moments", theory: "For rotational equilibrium: ΣClockwise Torques = ΣAnticlockwise Torques. Torque (moment) = Force × perpendicular distance from pivot." },
      // UNIT 4: Electricity
      { id: "p10-7", unit: 4, unitName: "Current Electricity", title: "Ohm's Law – Circuit Builder", objective: "Build a circuit and verify Ohm's Law (V = IR)", theory: "Ohm's Law: V = IR. A V–I graph for an ohmic conductor is a straight line through the origin. Ammeter in series, voltmeter in parallel." },
      // UNIT 5: Magnetism
      { id: "p10-8", unit: 5, unitName: "Magnetism", title: "Magnetic Field Visualization", objective: "Visualize magnetic field lines around a bar magnet", theory: "Magnetic field lines emerge from the North pole and enter the South pole. Iron filings reveal the pattern; a compass shows field direction." },
      // UNIT 6: Optics
      { id: "p10-9", unit: 6, unitName: "Optics", title: "Reflection of Light", objective: "Verify the law of reflection", theory: "Law of Reflection: angle of incidence = angle of reflection. Both angles are measured from the normal to the reflecting surface." },
      { id: "p10-10", unit: 6, unitName: "Optics", title: "Refraction – Snell's Law", objective: "Investigate Snell's law of refraction (n₁sinθ₁ = n₂sinθ₂)", theory: "Light bends when passing between media of different refractive indices. At the critical angle, total internal reflection occurs." },
    ],
    11: [
      // UNIT 1: Scientific Investigation
      { id: "p11-1", unit: 1, unitName: "Scientific Investigation", title: "Boiling Point vs Altitude", objective: "Investigate how altitude affects the boiling point of water", theory: "At higher altitudes atmospheric pressure is lower, reducing the boiling point. Approximately −0.34°C per 100 m increase." },
      // UNIT 2: Vectors
      { id: "p11-2", unit: 2, unitName: "Vectors", title: "Vector Addition", objective: "Determine the resultant of two vectors using the triangle/parallelogram method", theory: "Vectors add by components: Rx = Ax+Bx, Ry = Ay+By. The triangle method places vectors head-to-tail to find the resultant." },
      { id: "p11-3", unit: 2, unitName: "Vectors", title: "Field Displacement", objective: "Distinguish between distance traveled and displacement vector", theory: "Distance is total path length (scalar). Displacement is the straight-line vector from start to end." },
      // UNIT 3: Motion
      { id: "p11-4", unit: 3, unitName: "Motion", title: "Uniform Motion", objective: "Observe motion with constant velocity and plot distance-time graph", theory: "For uniform motion, distance = velocity × time. The distance-time graph is a straight line through the origin." },
      { id: "p11-5", unit: 3, unitName: "Motion", title: "Free Fall", objective: "Observe free fall and determine acceleration due to gravity", theory: "In free fall: v = gt, h = ½gt², v² = 2gh. Acceleration is constant at g = 9.8 m/s²." },
      { id: "p11-6", unit: 3, unitName: "Motion", title: "Projectile Motion", objective: "Analyze projectile trajectories and calculate range and maximum height", theory: "Range R = v²sin(2θ)/g, Max Height H = v²sin²(θ)/(2g), Time of flight T = 2vsinθ/g." },
      // UNIT 4: Dynamics
      { id: "p11-7", unit: 4, unitName: "Dynamics", title: "Newton's Second Law", objective: "Verify F = ma by varying force and mass", theory: "Newton's Second Law: F_net = ma. Net force equals mass times acceleration." },
      { id: "p11-8", unit: 4, unitName: "Dynamics", title: "Friction Experiment", objective: "Compare static and kinetic friction on different surfaces", theory: "Friction force = μN. Static friction > kinetic friction. μ depends on surface properties." },
      { id: "p11-9", unit: 4, unitName: "Dynamics", title: "Inclined Plane", objective: "Analyze forces on a block on an inclined surface", theory: "Parallel force = mgsinθ, Normal force = mgcosθ, Friction = μN." },
      // UNIT 5: Heat
      { id: "p11-10", unit: 5, unitName: "Heat & Calorimetry", title: "Heat Conduction", objective: "Observe heat transfer through a rod and compare materials", theory: "Heat conducts by molecular vibration. Rate depends on conductivity k, ΔT, area, and length." },
      { id: "p11-11", unit: 5, unitName: "Heat & Calorimetry", title: "Calorimetry (Mixing Water)", objective: "Verify conservation of energy when mixing hot and cold water", theory: "Q_lost = Q_gained. mcΔT (hot) = mcΔT (cold). The final temperature depends on masses and initial temperatures." },
      // UNIT 6: Electricity
      { id: "p11-12", unit: 6, unitName: "Electrostatics & Circuits", title: "Coulomb's Law", objective: "Explore the electrostatic force between two charged objects", theory: "Coulomb's Law: F = kq₁q₂/r². Like charges repel, opposite charges attract. Force follows inverse square law." },
      { id: "p11-13", unit: 6, unitName: "Electrostatics & Circuits", title: "Electric Circuit (Ohm's Law)", objective: "Build a circuit and verify Ohm's Law (V = IR)", theory: "Ohm's Law: V = IR. Current is proportional to voltage and inversely proportional to resistance." },
      // UNIT 7: Nuclear Physics
      { id: "p11-14", unit: 7, unitName: "Nuclear Physics", title: "Radioactive Decay", objective: "Observe random decay and determine half-life from decay curve", theory: "Radioactive decay is random. On average, half the atoms decay each half-life. N = N₀(½)^(t/t½)." },
    ],
    12: [
      // UNIT 1: Medical Physics
      { id: "p12-1", unit: 1, unitName: "Medical Physics", title: "MRI Simulation", objective: "Understand MRI by manipulating magnetic field strength and pulse parameters", theory: "MRI uses strong magnetic fields to align proton spins. An RF pulse tips protons; signal during relaxation (T1/T2) creates tissue contrast." },
      // UNIT 2: Projectile Motion
      { id: "p12-2", unit: 2, unitName: "Projectile Motion", title: "Horizontal Projectile", objective: "Investigate range and time of flight of a horizontally projected object", theory: "In horizontal projection, vy₀ = 0. Time: t = √(2h/g). Range R = v₀ × t. Horizontal and vertical motions are independent." },
      { id: "p12-3", unit: 2, unitName: "Projectile Motion", title: "Projectile at an Angle", objective: "Investigate how angle of projection affects the range", theory: "R = v₀²sin(2θ)/g. Maximum range at 45°. Complementary angles yield the same range." },
      // UNIT 3: Fluid Mechanics
      { id: "p12-4", unit: 3, unitName: "Fluid Mechanics", title: "Pressure vs Depth", objective: "Investigate how pressure varies with depth in a fluid", theory: "P = P₀ + ρgh. Pressure increases linearly with depth." },
      { id: "p12-5", unit: 3, unitName: "Fluid Mechanics", title: "Archimedes' Principle", objective: "Verify Archimedes' Principle by comparing buoyant force with weight of displaced fluid", theory: "Buoyant force = weight of displaced fluid = ρVg. Apparent weight = actual weight − buoyant force." },
      // UNIT 4: Electromagnetism
      { id: "p12-6", unit: 4, unitName: "Electromagnetism", title: "Magnetic Field — Current Wire", objective: "Observe magnetic field patterns around a current-carrying conductor", theory: "A current-carrying wire produces concentric circular magnetic field lines. B = μ₀I/(2πr). Use the Right-Hand Rule." },
      { id: "p12-7", unit: 4, unitName: "Electromagnetism", title: "Electromagnetic Induction", objective: "Observe induced EMF due to changing magnetic flux", theory: "Faraday's Law: EMF = −N(dΦ/dt). Moving a magnet near a coil changes flux and induces voltage." },
      // UNIT 5: Electronics
      { id: "p12-8", unit: 5, unitName: "Electronics", title: "PN Junction Diode", objective: "Study I-V characteristics of a diode in forward and reverse bias", theory: "Silicon diode threshold ~0.7V. In forward bias, current rises exponentially. In reverse bias, only leakage current flows." },
      { id: "p12-9", unit: 5, unitName: "Electronics", title: "Half-Wave Rectifier", objective: "Study half-wave rectification using a diode", theory: "Half-wave rectification passes only positive half-cycles. Avg DC = V_peak/π." },
    ],
  },
  chemistry: {
    9: [
      { id: "c9-1", unit: 1, unitName: "Lab Safety", title: "Lab Safety & Measurement", objective: "Learn lab safety protocols and basic measurement techniques", theory: "Lab safety includes wearing goggles, proper chemical handling, and knowing emergency procedures. Accurate measurement is the foundation of chemistry." },
      { id: "c9-2", unit: 2, unitName: "Matter", title: "States of Matter", objective: "Observe phase transitions of water by changing temperature", theory: "Matter exists in solid, liquid, and gas states. Water melts at 0°C and boils at 100°C. Molecular motion increases with temperature." },
      { id: "c9-3", unit: 3, unitName: "Atomic Structure", title: "Atomic Structure (Bohr Model)", objective: "Build atomic models by placing protons, neutrons, and electrons", theory: "The Bohr model places electrons in shells: 1st shell holds 2, 2nd holds 8, 3rd holds 18. Atomic number = protons = electrons (neutral atom)." },
      { id: "c9-4", unit: 4, unitName: "Chemical Bonding", title: "Chemical Bonding (Ionic & Covalent)", objective: "Understand ionic and covalent bonding by observing electron transfer and sharing", theory: "Ionic bonds form when electrons transfer between atoms (metal + non-metal). Covalent bonds form when electrons are shared (non-metal + non-metal)." },
      { id: "c9-5", unit: 5, unitName: "Chemical Reactions", title: "Chemical Reactions (Combination)", objective: "Observe a combination reaction: Iron + Sulphur → Iron Sulphide", theory: "In a combination reaction, two or more substances combine to form a single product. Fe + S → FeS is an exothermic reaction." },
      { id: "c9-6", unit: 6, unitName: "Conservation of Mass", title: "Conservation of Mass", objective: "Verify that mass is conserved in a chemical reaction", theory: "The Law of Conservation of Mass states that mass cannot be created or destroyed in a chemical reaction. Total mass of reactants = total mass of products." },
      { id: "c9-7", unit: 7, unitName: "Solutions", title: "Solutions & Dissolving", objective: "Understand dissolving and concentration", theory: "A solution is a homogeneous mixture of solute and solvent. Solubility increases with temperature for most solids. Concentration = mass of solute / volume of solution." },
      { id: "c9-8", unit: 8, unitName: "Acids & Bases", title: "Acids, Bases & Salts", objective: "Identify acids and bases using indicators and pH meters", theory: "Acids: pH < 7, turn blue litmus red. Bases: pH > 7, turn red litmus blue. Neutralization: Acid + Base → Salt + Water." },
      { id: "c9-9", unit: 9, unitName: "Metals & Non-Metals", title: "Metals & Non-Metals Reactivity", objective: "Observe the reaction of metals with acids and compare reactivity", theory: "Reactive metals displace hydrogen from acids: Metal + HCl → Metal Chloride + H₂. Reactivity: Mg > Zn > Fe > Cu." },
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
      // UNIT 1: Scientific Method & Classification
      { id: "b10-1", unit: 1, unitName: "Scientific Method & Classification", title: "Classification Lab", objective: "Classify living and non-living things by their characteristics", theory: "Living things exhibit growth, reproduction, respiration, excretion, irritability, nutrition, and movement. Non-living things lack these characteristics." },
      { id: "b10-2", unit: 1, unitName: "Scientific Method & Classification", title: "Scientific Method Simulation", objective: "Practice the scientific method by designing and running an experiment", theory: "The scientific method involves: observation → question → hypothesis → experiment → data collection → conclusion. Variables must be controlled for valid results." },
      // UNIT 2: Cell Biology
      { id: "b10-3", unit: 2, unitName: "Cell Biology", title: "Microscope Parts Lab", objective: "Identify and learn the function of each microscope part", theory: "A compound microscope has eyepiece (10×), objective lenses (4×, 10×, 40×), stage, coarse/fine focus knobs, diaphragm, and mirror/light source." },
      { id: "b10-4", unit: 2, unitName: "Cell Biology", title: "Onion Epidermis Slide", objective: "Prepare and observe an onion epidermis slide under a microscope", theory: "Onion epidermal cells are rectangular with visible cell wall, nucleus, and cytoplasm. Iodine stain enhances contrast for observation." },
      { id: "b10-5", unit: 2, unitName: "Cell Biology", title: "Diffusion Demonstration", objective: "Observe the process of diffusion in water", theory: "Diffusion is the net movement of particles from high to low concentration. Potassium permanganate crystals dissolve and spread through water over time." },
      { id: "b10-6", unit: 2, unitName: "Cell Biology", title: "Osmosis Experiment", objective: "Demonstrate osmosis using potato strips in different solutions", theory: "Osmosis is the movement of water across a semi-permeable membrane from dilute to concentrated solution. Potato strips swell in water and shrink in salt solution." },
      // UNIT 3: Food Tests
      { id: "b10-7", unit: 3, unitName: "Food Tests", title: "Starch Test (Iodine)", objective: "Test for the presence of starch in food samples", theory: "Iodine solution turns blue-black in the presence of starch due to iodine molecules fitting inside the amylose helix structure." },
      { id: "b10-8", unit: 3, unitName: "Food Tests", title: "Protein Test (Biuret)", objective: "Test for the presence of protein in food samples", theory: "Biuret reagent (copper sulfate in NaOH) turns purple in the presence of peptide bonds. The Cu²⁺ ions complex with nitrogen atoms in the bonds." },
      { id: "b10-9", unit: 3, unitName: "Food Tests", title: "Lipid Test (Sudan III)", objective: "Test for the presence of lipids in food samples", theory: "Sudan III is a fat-soluble dye that stains lipids red/orange. A red oil layer at the top of the test tube indicates lipid presence." },
      // UNIT 4: Respiration
      { id: "b10-10", unit: 4, unitName: "Respiration", title: "CO₂ Production Test", objective: "Demonstrate that exhaled air contains carbon dioxide", theory: "Exhaled air contains ~4% CO₂ compared to ~0.04% in inhaled air. CO₂ turns limewater milky by forming insoluble calcium carbonate: CO₂ + Ca(OH)₂ → CaCO₃ + H₂O." },
      { id: "b10-11", unit: 4, unitName: "Respiration", title: "Breathing Rate Investigation", objective: "Measure and compare breathing rates at rest and after exercise", theory: "Exercise increases oxygen demand in muscles. The body responds by increasing breathing rate and depth to supply more O₂ and remove CO₂." },
      // UNIT 5: Transport in Plants
      { id: "b10-12", unit: 5, unitName: "Transport in Plants", title: "Transpiration Lab", objective: "Demonstrate transpiration using cobalt chloride paper", theory: "Cobalt chloride paper changes from blue to pink in the presence of moisture. This indicates water vapor release from leaf stomata during transpiration." },
      { id: "b10-13", unit: 5, unitName: "Transport in Plants", title: "Water Transport (Colored Dye)", objective: "Observe water transport through xylem vessels", theory: "Xylem vessels transport water and minerals from roots to leaves. Colored dye is drawn up by transpiration pull, making xylem visible in cross-sections." },
      // UNIT 6: Plant Reproduction
      { id: "b10-14", unit: 6, unitName: "Plant Reproduction", title: "Flower Dissection", objective: "Dissect a flower and identify its reproductive parts", theory: "Flowers contain sepals (protection), petals (attract pollinators), stamens (male: anther + filament produce pollen), and pistil (female: stigma + style + ovary)." },
      // UNIT 7: Skeletal System
      { id: "b10-15", unit: 7, unitName: "Skeletal System", title: "Identifying Bones", objective: "Identify major bones and their functions in the human skeleton", theory: "The human skeleton has 206 bones providing support, protection, movement, blood cell production, and mineral storage. Major bones include skull, vertebrae, ribs, femur." },
      // UNIT 8: Circulatory System
      { id: "b10-16", unit: 8, unitName: "Circulatory System", title: "Measuring Pulse Rate", objective: "Measure pulse rate at rest and after exercise", theory: "Pulse rate reflects heart contractions pumping blood. Normal resting rate is 60-100 bpm. Exercise increases heart rate to deliver more oxygen to muscles." },
      // UNIT 9: Nervous System
      { id: "b10-17", unit: 9, unitName: "Nervous System", title: "Reflex Action Demo", objective: "Demonstrate and explain the knee-jerk reflex", theory: "A reflex arc: stimulus → receptor → sensory neuron → spinal cord → motor neuron → effector (muscle). Reflexes are involuntary, rapid protective responses." },
      // UNIT 10: Ecology
      { id: "b10-18", unit: 10, unitName: "Ecology", title: "Quadrat Sampling", objective: "Estimate plant population using quadrat sampling method", theory: "Quadrat sampling places a frame at random positions to count organisms. Average count × total area / quadrat area = estimated population." },
    ],
    11: [
      // UNIT 1: Cell Biology
      { id: "b11-1", unit: 1, unitName: "Cell Biology", title: "Cell Structure (Microscope)", objective: "Observe and identify the structure of plant and animal cells", theory: "Plant cells have a cell wall, large vacuole, and chloroplasts. Animal cells lack these but have centrioles. Both contain nucleus, cytoplasm, mitochondria, and cell membrane." },
      { id: "b11-2", unit: 1, unitName: "Cell Biology", title: "Osmosis & Diffusion", objective: "Investigate the movement of water through a semi-permeable membrane", theory: "Osmosis is the net movement of water from dilute to concentrated solution across a semi-permeable membrane. Diffusion is passive movement from high to low concentration." },
      // UNIT 2: Molecular Biology
      { id: "b11-3", unit: 2, unitName: "Molecular Biology", title: "Food Tests", objective: "Test for biological molecules (starch, sugars, protein, lipids) in food samples", theory: "Iodine tests starch (blue-black), Benedict's tests reducing sugars (orange on heating), Biuret tests protein (purple), ethanol emulsion tests lipids (milky white)." },
      { id: "b11-4", unit: 2, unitName: "Molecular Biology", title: "Enzyme Activity", objective: "Investigate how temperature and pH affect enzyme reaction rates", theory: "Enzymes are biological catalysts with optimal temperature (~37°C) and pH. Beyond optimal conditions, the active site denatures and activity drops sharply." },
      // UNIT 3: Energy Transformations
      { id: "b11-5", unit: 3, unitName: "Energy Transformations", title: "Photosynthesis", objective: "Investigate factors affecting the rate of photosynthesis", theory: "6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂. Rate depends on light intensity, CO₂ concentration, and temperature. Oxygen bubbles indicate reaction rate." },
      { id: "b11-6", unit: 3, unitName: "Energy Transformations", title: "Respiration", objective: "Detect carbon dioxide produced during respiration", theory: "Aerobic: C₆H₁₂O₆ + 6O₂ → 6CO₂ + 6H₂O + ATP. Anaerobic (yeast): C₆H₁₂O₆ → 2C₂H₅OH + 2CO₂. CO₂ turns limewater milky." },
      // UNIT 4: Plant Biology
      { id: "b11-7", unit: 4, unitName: "Plant Biology", title: "Plant Tissues", objective: "Observe and identify plant tissues in a stem cross-section", theory: "Plant stems contain epidermis (protection), cortex (storage), xylem (water transport), and phloem (sugar transport). Each tissue has distinct cell shapes." },
      { id: "b11-8", unit: 4, unitName: "Plant Biology", title: "Transpiration", objective: "Investigate factors affecting transpiration rate", theory: "Transpiration is water loss from leaves through stomata. Rate increases with temperature, wind speed, and light; decreases with humidity." },
      // UNIT 5: Human Biology
      { id: "b11-9", unit: 5, unitName: "Human Biology", title: "Human Tissues (Histology)", objective: "Identify different human tissue types under microscopy", theory: "Four main tissue types: epithelial (covering), connective (support), muscle (movement), and nervous (signaling). Each has distinct cellular characteristics." },
      { id: "b11-10", unit: 5, unitName: "Human Biology", title: "Blood Cells", objective: "Observe and identify different blood cell types", theory: "Blood contains red blood cells (oxygen transport), white blood cells (immunity), and platelets (clotting). RBCs are biconcave and lack a nucleus." },
      // UNIT 6: Genetics
      { id: "b11-11", unit: 6, unitName: "Genetics", title: "Monohybrid Cross (Punnett Square)", objective: "Predict offspring ratios using a Punnett Square", theory: "A monohybrid cross examines one gene. Heterozygous cross (Aa × Aa) yields 1:2:1 genotypic ratio and 3:1 phenotypic ratio (with complete dominance)." },
      // UNIT 7: Ecology
      { id: "b11-12", unit: 7, unitName: "Ecology", title: "Quadrat Sampling", objective: "Estimate population density using quadrat sampling", theory: "Quadrat sampling places a frame at random positions to count organisms. Population density = total count / (number of quadrats × quadrat area)." },
    ],
    12: [
      // UNIT 1: Biotechnology
      { id: "b12-1", unit: 1, unitName: "Biotechnology", title: "Recombinant DNA Simulation", objective: "Create recombinant DNA by inserting a gene into a bacterial plasmid", theory: "Restriction enzymes cut DNA at recognition sites. DNA ligase joins fragments. Transformed bacteria express the foreign gene." },
      // UNIT 2: Microbiology
      { id: "b12-2", unit: 2, unitName: "Microbiology", title: "Microorganism Observation", objective: "Observe and compare bacteria, fungi, and viruses under a virtual microscope", theory: "Microorganisms differ in size, structure, and staining properties. Gram staining differentiates bacteria by cell wall composition." },
      // UNIT 3: Ecology
      { id: "b12-3", unit: 3, unitName: "Ecology", title: "Ecosystem Simulation", objective: "Build an ecosystem and observe population dynamics and predator-prey interactions", theory: "Producers form the base of food chains. Predator-prey interactions create cyclic population patterns. Environmental factors affect all trophic levels." },
      // UNIT 4: Evolution
      { id: "b12-4", unit: 4, unitName: "Evolution", title: "Natural Selection Simulator", objective: "Observe how environmental pressures drive allele frequency changes over generations", theory: "Natural selection favors organisms with traits better suited to their environment. Over generations, allele frequencies shift, driving evolution." },
      // UNIT 5: Nervous System
      { id: "b12-5", unit: 5, unitName: "Coordination & Response", title: "Pupil Reflex Experiment", objective: "Observe how pupil size changes in response to light intensity", theory: "The pupil reflex is an involuntary response. In bright light, circular muscles contract (constriction). In dim light, radial muscles contract (dilation)." },
      { id: "b12-6", unit: 5, unitName: "Coordination & Response", title: "Light Refraction Experiment", objective: "Observe how light refracts when passing through water", theory: "Light bends (refracts) when passing from one medium to another due to change in speed. Objects in water appear shifted or bent." },
      // UNIT 6: Reproduction
      { id: "b12-7", unit: 6, unitName: "Reproduction", title: "Hormone Cycle (Menstrual Cycle)", objective: "Track hormone levels and ovarian changes through the 28-day cycle", theory: "FSH stimulates follicle growth, estrogen thickens the uterine lining, LH triggers ovulation, progesterone maintains the lining." },
      // UNIT 7: Genetics
      { id: "b12-8", unit: 7, unitName: "Genetics", title: "Punnett Square Simulation", objective: "Predict offspring ratios using a Punnett Square for monohybrid crosses", theory: "A monohybrid cross examines one gene. Heterozygous cross (Aa × Aa) yields 1:2:1 genotypic ratio and 3:1 phenotypic ratio." },
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
