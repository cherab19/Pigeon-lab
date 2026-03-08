import { ComponentType } from "react";

// Lazy-load 2D fallbacks only when needed
const lazy = (fn: () => Promise<{ [key: string]: ComponentType }>, name: string) =>
  () => fn().then(m => ({ default: (m as any)[name] as ComponentType }));

import { lazy as reactLazy } from "react";

// Physics 2D fallbacks
const p9 = () => import("./physics/Grade9Physics");
const p10 = () => import("./physics/Grade10Physics");
const p11 = () => import("./physics/Grade11Physics");
const p12 = () => import("./physics/Grade12Physics");
// Chemistry 2D fallbacks
const c9 = () => import("./chemistry/Grade9Chemistry");
const c10 = () => import("./chemistry/Grade10Chemistry");
const c11 = () => import("./chemistry/Grade11Chemistry");
const c12 = () => import("./chemistry/Grade12Chemistry");
// Biology 2D fallbacks
const b9 = () => import("./biology/Grade9Biology");
const b10 = () => import("./biology/Grade10Biology");
const b11 = () => import("./biology/Grade11Biology");
const b12 = () => import("./biology/Grade12Biology");

export const fallback2DRegistry: Record<string, ComponentType> = {};

// We build this as a function to lazily populate
const mapping: Record<string, [() => Promise<any>, string]> = {
  "p9-1": [p9, "MeasuringLength"], "p9-2": [p9, "BeamBalanceLab"], "p9-3": [p9, "TimeMeasurementLab"],
  "p9-4": [p9, "DistanceDisplacementLab"], "p9-5": [p9, "GraphicalMotionLab"],
  "p9-6": [p9, "NewtonsSecondLaw"], "p9-7": [p9, "WorkEnergyLab"], "p9-8": [p9, "HookesLawLab"],
  "p9-9": [p9, "LeverLab"], "p9-10": [p9, "InclinedPlaneLab"],
  "p9-11": [p9, "PendulumLab"], "p9-12": [p9, "WaveSimulation"],
  "p9-13": [p9, "ThermalExpansionLab"], "p9-14": [p9, "TemperatureMeasurementLab"],
  "p10-1": [p10, "VectorAddition"], "p10-2": [p10, "VectorResolution"],
  "p10-3": [p10, "DistanceDisplacement"], "p10-4": [p10, "AccelerationSim"],
  "p10-5": [p10, "StressStrainLab"], "p10-6": [p10, "TorqueEquilibrium"],
  "p10-7": [p10, "CircuitBuilder"], "p10-8": [p10, "MagneticFieldLab"],
  "p10-9": [p10, "ReflectionLab"], "p10-10": [p10, "ReflectionRefraction"],
  "p11-1": [p11, "BoilingPointAltitude"], "p11-2": [p11, "VectorAddition11"],
  "p11-3": [p11, "FieldDisplacement"], "p11-4": [p11, "UniformMotion"],
  "p11-5": [p11, "FreeFall"], "p11-6": [p11, "ProjectileMotion"],
  "p11-7": [p11, "NewtonsSecondLaw11"], "p11-8": [p11, "FrictionExperiment"],
  "p11-9": [p11, "InclinedPlane"], "p11-10": [p11, "HeatConduction"],
  "p11-11": [p11, "Calorimetry"], "p11-12": [p11, "CoulombsLaw"],
  "p11-13": [p11, "ElectricCircuit"], "p11-14": [p11, "RadioactiveDecay"],
  "p12-1": [p12, "MRISimulation"], "p12-2": [p12, "HorizontalProjectile"],
  "p12-3": [p12, "AngledProjectile"], "p12-4": [p12, "FluidPressureLab"],
  "p12-5": [p12, "ArchimedesPrinciple"], "p12-6": [p12, "MagneticFieldWire"],
  "p12-7": [p12, "ElectromagneticInduction"], "p12-8": [p12, "PNJunctionDiode"],
  "p12-9": [p12, "HalfWaveRectifier"],
  "c9-1": [c9, "LabSafety"], "c9-2": [c9, "StatesOfMatter"], "c9-3": [c9, "AtomicStructure"],
  "c9-4": [c9, "ChemicalBonding"], "c9-5": [c9, "ChemicalReactions"],
  "c9-6": [c9, "ConservationOfMass"], "c9-7": [c9, "SolutionsLab"],
  "c9-8": [c9, "AcidsBasesLab"], "c9-9": [c9, "MetalsNonMetals"],
  "c10-1": [c10, "CombinationReaction"], "c10-2": [c10, "DecompositionCuCO3"],
  "c10-3": [c10, "SingleDisplacement"], "c10-4": [c10, "DoubleDisplacement"],
  "c10-5": [c10, "StandardSolution"], "c10-6": [c10, "DilutionLab"],
  "c10-7": [c10, "SolubilityTemp"], "c10-8": [c10, "PHIndicators"],
  "c10-9": [c10, "AcidMetalReaction"], "c10-10": [c10, "AcidBaseTitration"],
  "c10-11": [c10, "ExoEndothermic"], "c10-12": [c10, "ElectrochemicalCell"],
  "c10-13": [c10, "ElectrolysisWater"], "c10-14": [c10, "ReactivitySeries"],
  "c10-15": [c10, "MetalExtraction"], "c10-16": [c10, "HydrocarbonCombustion"],
  "c10-17": [c10, "BromineTest"],
  "c11-1": [c11, "CathodeRayTube"], "c11-2": [c11, "RutherfordExperiment"],
  "c11-3": [c11, "PhotoelectricEffect"], "c11-4": [c11, "IonicBondFormation"],
  "c11-5": [c11, "VSEPRGeometry"], "c11-6": [c11, "MetallicBonding"],
  "c11-7": [c11, "KineticMolecularTheory"], "c11-8": [c11, "BoylesLaw"],
  "c11-9": [c11, "HeatingCurve"], "c11-10": [c11, "ReactionRate"],
  "c11-11": [c11, "CatalystSimulation"], "c11-12": [c11, "ReversibleReaction"],
  "c11-13": [c11, "LeChatelierPrinciple"], "c11-14": [c11, "Esterification"],
  "c11-15": [c11, "Saponification"],
  "c12-1": [c12, "IndicatorsLab"], "c12-2": [c12, "PHMeterSim"],
  "c12-3": [c12, "WeakAcidIonization"], "c12-4": [c12, "BufferSolutions"],
  "c12-5": [c12, "AcidBaseTitration"], "c12-6": [c12, "ElectrolysisMetal"],
  "c12-7": [c12, "VoltaicCell"], "c12-8": [c12, "HaberProcess"],
  "c12-9": [c12, "AdditionPolymerization"], "c12-10": [c12, "AirPollutionAcidRain"],
  "b9-1": [b9, "MicroscopeSimulation"], "b9-2": [b9, "SeedGerminationLab"],
  "b9-3": [b9, "DichotomousKeyLab"], "b9-4": [b9, "OnionCellObservation"],
  "b9-5": [b9, "OsmosisExperiment"], "b9-6": [b9, "StarchTestLab"],
  "b9-7": [b9, "ProteinTestLab"], "b9-8": [b9, "FoodChainBuilder"],
  "b10-1": [b10, "ClassificationLab"], "b10-2": [b10, "ScientificMethodSim"],
  "b10-3": [b10, "MicroscopePartsLab"], "b10-4": [b10, "OnionEpidermisSlideLab"],
  "b10-5": [b10, "DiffusionDemo"], "b10-6": [b10, "OsmosisSimulation"],
  "b10-7": [b10, "StarchTestLab"], "b10-8": [b10, "ProteinTestLab"],
  "b10-9": [b10, "LipidTestLab"], "b10-10": [b10, "CO2ProductionTest"],
  "b10-11": [b10, "BreathingRateInvestigation"], "b10-12": [b10, "TranspirationLab"],
  "b10-13": [b10, "WaterTransportDye"], "b10-14": [b10, "FlowerDissection"],
  "b10-15": [b10, "IdentifyingBones"], "b10-16": [b10, "MeasuringPulseRate"],
  "b10-17": [b10, "ReflexActionDemo"], "b10-18": [b10, "QuadratSampling"],
  "b11-1": [b11, "CellStructureMicroscope"], "b11-2": [b11, "OsmosisDiffusion"],
  "b11-3": [b11, "FoodTests11"], "b11-4": [b11, "EnzymeActivity"],
  "b11-5": [b11, "Photosynthesis"], "b11-6": [b11, "Respiration"],
  "b11-7": [b11, "PlantTissues"], "b11-8": [b11, "Transpiration"],
  "b11-9": [b11, "HumanTissues"], "b11-10": [b11, "BloodCells"],
  "b11-11": [b11, "MonohybridCross"], "b11-12": [b11, "QuadratSampling"],
  "b12-1": [b12, "RecombinantDNA"], "b12-2": [b12, "MicroorganismObservation"],
  "b12-3": [b12, "EcosystemSimulation"], "b12-4": [b12, "NaturalSelection"],
  "b12-5": [b12, "PupilReflexExperiment"], "b12-6": [b12, "ReflexArcSynapse"],
  "b12-7": [b12, "HormoneCycle"], "b12-8": [b12, "PunnettSquareSimulation"],
};

// Build lazy components
for (const [id, [loader, name]] of Object.entries(mapping)) {
  fallback2DRegistry[id] = reactLazy(lazy(loader, name));
}
