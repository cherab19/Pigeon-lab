import { ComponentType } from "react";
import { MeasuringLength, BeamBalanceLab, TimeMeasurementLab, DistanceDisplacementLab, GraphicalMotionLab, NewtonsSecondLaw, WorkEnergyLab, HookesLawLab, LeverLab, InclinedPlaneLab, PendulumLab, WaveSimulation, ThermalExpansionLab, TemperatureMeasurementLab } from "./physics/Grade9Physics";
import { VectorAddition, VectorResolution, DistanceDisplacement, AccelerationSim, StressStrainLab, TorqueEquilibrium, CircuitBuilder, MagneticFieldLab, ReflectionLab, ReflectionRefraction } from "./physics/Grade10Physics";
import { BoilingPointAltitude, VectorAddition11, FieldDisplacement, UniformMotion, FreeFall, ProjectileMotion, NewtonsSecondLaw11, FrictionExperiment, InclinedPlane, HeatConduction, Calorimetry, CoulombsLaw, ElectricCircuit, RadioactiveDecay } from "./physics/Grade11Physics";
import { MRISimulation, HorizontalProjectile, AngledProjectile, FluidPressureLab, ArchimedesPrinciple, MagneticFieldWire, ElectromagneticInduction, PNJunctionDiode, HalfWaveRectifier } from "./physics/Grade12Physics";
import { LabSafety, StatesOfMatter, AtomicStructure, ChemicalBonding, ChemicalReactions, ConservationOfMass, SolutionsLab, AcidsBasesLab, MetalsNonMetals } from "./chemistry/Grade9Chemistry";
import { SingleDisplacement, StandardSolution, AcidBaseTitration, PHIndicators } from "./chemistry/Grade10Chemistry";
import { RutherfordExperiment, PhotoelectricEffect, ReactionRate, LeChatelierPrinciple } from "./chemistry/Grade11Chemistry";
import { WeakAcidIonization, BufferSolutions, VoltaicCell, HaberProcess } from "./chemistry/Grade12Chemistry";
import { MicroscopeSimulation, SeedGerminationLab, DichotomousKeyLab, OnionCellObservation, OsmosisExperiment, StarchTestLab, ProteinTestLab, FoodChainBuilder } from "./biology/Grade9Biology";
import { ClassificationLab, ScientificMethodSim, MicroscopePartsLab, OnionEpidermisSlideLab, DiffusionDemo, OsmosisSimulation, StarchTestLab as B10StarchTest, ProteinTestLab as B10ProteinTest, LipidTestLab, CO2ProductionTest, BreathingRateInvestigation, TranspirationLab, WaterTransportDye, FlowerDissection, IdentifyingBones, MeasuringPulseRate, ReflexActionDemo, QuadratSampling as B10QuadratSampling } from "./biology/Grade10Biology";
import { CellStructureMicroscope, OsmosisDiffusion, FoodTests11, EnzymeActivity, Photosynthesis, Respiration, PlantTissues, Transpiration, HumanTissues, BloodCells, MonohybridCross, QuadratSampling as B11QuadratSampling } from "./biology/Grade11Biology";
import { RecombinantDNA, MicroorganismObservation, EcosystemSimulation, NaturalSelection, PupilReflexExperiment, ReflexArcSynapse, HormoneCycle, PunnettSquareSimulation } from "./biology/Grade12Biology";

export const simulationRegistry: Record<string, ComponentType> = {
  "p9-1": MeasuringLength, "p9-2": BeamBalanceLab, "p9-3": TimeMeasurementLab,
  "p9-4": DistanceDisplacementLab, "p9-5": GraphicalMotionLab,
  "p9-6": NewtonsSecondLaw, "p9-7": WorkEnergyLab, "p9-8": HookesLawLab,
  "p9-9": LeverLab, "p9-10": InclinedPlaneLab,
  "p9-11": PendulumLab, "p9-12": WaveSimulation,
  "p9-13": ThermalExpansionLab, "p9-14": TemperatureMeasurementLab,
  "p10-1": VectorAddition, "p10-2": VectorResolution, "p10-3": DistanceDisplacement, "p10-4": AccelerationSim,
  "p10-5": StressStrainLab, "p10-6": TorqueEquilibrium, "p10-7": CircuitBuilder,
  "p10-8": MagneticFieldLab, "p10-9": ReflectionLab, "p10-10": ReflectionRefraction,
  "p11-1": BoilingPointAltitude, "p11-2": VectorAddition11, "p11-3": FieldDisplacement,
  "p11-4": UniformMotion, "p11-5": FreeFall, "p11-6": ProjectileMotion,
  "p11-7": NewtonsSecondLaw11, "p11-8": FrictionExperiment, "p11-9": InclinedPlane,
  "p11-10": HeatConduction, "p11-11": Calorimetry,
  "p11-12": CoulombsLaw, "p11-13": ElectricCircuit,
  "p11-14": RadioactiveDecay,
  "p12-1": MRISimulation, "p12-2": HorizontalProjectile, "p12-3": AngledProjectile,
  "p12-4": FluidPressureLab, "p12-5": ArchimedesPrinciple,
  "p12-6": MagneticFieldWire, "p12-7": ElectromagneticInduction,
  "p12-8": PNJunctionDiode, "p12-9": HalfWaveRectifier,
  "c9-1": LabSafety, "c9-2": StatesOfMatter, "c9-3": AtomicStructure, "c9-4": ChemicalReactions, "c9-5": ConservationOfMass,
  "c10-1": SingleDisplacement, "c10-2": StandardSolution, "c10-3": AcidBaseTitration, "c10-4": PHIndicators,
  "c11-1": RutherfordExperiment, "c11-2": PhotoelectricEffect, "c11-3": ReactionRate, "c11-4": LeChatelierPrinciple,
  "c12-1": WeakAcidIonization, "c12-2": BufferSolutions, "c12-3": VoltaicCell, "c12-4": HaberProcess,
  "b9-1": MicroscopeSimulation, "b9-2": SeedGerminationLab, "b9-3": DichotomousKeyLab,
  "b9-4": OnionCellObservation, "b9-5": OsmosisExperiment,
  "b9-6": StarchTestLab, "b9-7": ProteinTestLab, "b9-8": FoodChainBuilder,
  "b10-1": ClassificationLab, "b10-2": ScientificMethodSim,
  "b10-3": MicroscopePartsLab, "b10-4": OnionEpidermisSlideLab, "b10-5": DiffusionDemo, "b10-6": OsmosisSimulation,
  "b10-7": B10StarchTest, "b10-8": B10ProteinTest, "b10-9": LipidTestLab,
  "b10-10": CO2ProductionTest, "b10-11": BreathingRateInvestigation,
  "b10-12": TranspirationLab, "b10-13": WaterTransportDye,
  "b10-14": FlowerDissection,
  "b10-15": IdentifyingBones,
  "b10-16": MeasuringPulseRate,
  "b10-17": ReflexActionDemo,
  "b10-18": B10QuadratSampling,
  "b11-1": CellStructureMicroscope, "b11-2": OsmosisDiffusion, "b11-3": FoodTests11, "b11-4": EnzymeActivity,
  "b11-5": Photosynthesis, "b11-6": Respiration, "b11-7": PlantTissues, "b11-8": Transpiration,
  "b11-9": HumanTissues, "b11-10": BloodCells, "b11-11": MonohybridCross, "b11-12": B11QuadratSampling,
  "b12-1": RecombinantDNA, "b12-2": MicroorganismObservation, "b12-3": EcosystemSimulation, "b12-4": NaturalSelection,
  "b12-5": PupilReflexExperiment, "b12-6": ReflexArcSynapse, "b12-7": HormoneCycle, "b12-8": PunnettSquareSimulation,
};
