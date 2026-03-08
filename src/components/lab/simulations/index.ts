import { ComponentType } from "react";
import { MeasuringLength, BeamBalanceLab, TimeMeasurementLab, DistanceDisplacementLab, GraphicalMotionLab, NewtonsSecondLaw, WorkEnergyLab, HookesLawLab, LeverLab, InclinedPlaneLab, PendulumLab, WaveSimulation, ThermalExpansionLab, TemperatureMeasurementLab } from "./physics/Grade9Physics";
import { SimplePendulum3D } from "./physics/SimplePendulum3D";
import { MeasuringLength3D, BeamBalance3D, TimeMeasurement3D, DistanceDisplacement3D, GraphicalMotion3D } from "./physics/Grade9Physics3D_Batch1";
import { NewtonsSecondLaw3D, WorkEnergy3D, HookesLaw3D, Lever3D, InclinedPlane3D } from "./physics/Grade9Physics3D_Batch2";
import { WaveSimulation3D, ThermalExpansion3D, TemperatureMeasurement3D } from "./physics/Grade9Physics3D_Batch3";
import { VectorAddition, VectorResolution, DistanceDisplacement, AccelerationSim, StressStrainLab, TorqueEquilibrium, CircuitBuilder, MagneticFieldLab, ReflectionLab, ReflectionRefraction } from "./physics/Grade10Physics";
import { VectorAddition3D, VectorResolution3D, DistanceDisplacement10_3D, AccelerationSim3D, StressStrain3D } from "./physics/Grade10Physics3D_Batch1";
import { TorqueEquilibrium3D, CircuitBuilder3D, MagneticField3D, Reflection3D, ReflectionRefraction3D } from "./physics/Grade10Physics3D_Batch2";
import { BoilingPointAltitude, VectorAddition11, FieldDisplacement, UniformMotion, FreeFall, ProjectileMotion, NewtonsSecondLaw11, FrictionExperiment, InclinedPlane, HeatConduction, Calorimetry, CoulombsLaw, ElectricCircuit, RadioactiveDecay } from "./physics/Grade11Physics";
import { BoilingPointAltitude3D, VectorAddition11_3D, FieldDisplacement3D, UniformMotion3D, FreeFall3D, ProjectileMotion3D, NewtonsSecondLaw11_3D } from "./physics/Grade11Physics3D_Batch1";
import { FrictionExperiment3D, InclinedPlane11_3D, HeatConduction3D, Calorimetry3D, CoulombsLaw3D, ElectricCircuit3D, RadioactiveDecay3D } from "./physics/Grade11Physics3D_Batch2";
import { MRISimulation, HorizontalProjectile, AngledProjectile, FluidPressureLab, ArchimedesPrinciple, MagneticFieldWire, ElectromagneticInduction, PNJunctionDiode, HalfWaveRectifier } from "./physics/Grade12Physics";
import { MRISimulation3D, HorizontalProjectile3D, AngledProjectile3D, FluidPressureLab3D, ArchimedesPrinciple3D } from "./physics/Grade12Physics3D_Batch1";
import { MagneticFieldWire3D, ElectromagneticInduction3D, PNJunctionDiode3D, HalfWaveRectifier3D } from "./physics/Grade12Physics3D_Batch2";
import { LabSafety, StatesOfMatter, AtomicStructure, ChemicalBonding, ChemicalReactions, ConservationOfMass, SolutionsLab, AcidsBasesLab, MetalsNonMetals } from "./chemistry/Grade9Chemistry";
import { CombinationReaction, DecompositionCuCO3, SingleDisplacement, DoubleDisplacement, StandardSolution, DilutionLab, SolubilityTemp, PHIndicators, AcidMetalReaction, AcidBaseTitration, ExoEndothermic, ElectrochemicalCell, ElectrolysisWater, ReactivitySeries, MetalExtraction, HydrocarbonCombustion, BromineTest } from "./chemistry/Grade10Chemistry";
import { CathodeRayTube, RutherfordExperiment, PhotoelectricEffect, IonicBondFormation, VSEPRGeometry, MetallicBonding, KineticMolecularTheory, BoylesLaw, HeatingCurve, ReactionRate, CatalystSimulation, ReversibleReaction, LeChatelierPrinciple, Esterification, Saponification } from "./chemistry/Grade11Chemistry";
import { IndicatorsLab, PHMeterSim, WeakAcidIonization, BufferSolutions, AcidBaseTitration as AcidBaseTitration12, ElectrolysisMetal, VoltaicCell, HaberProcess, AdditionPolymerization, AirPollutionAcidRain } from "./chemistry/Grade12Chemistry";
import { MicroscopeSimulation, SeedGerminationLab, DichotomousKeyLab, OnionCellObservation, OsmosisExperiment, StarchTestLab, ProteinTestLab, FoodChainBuilder } from "./biology/Grade9Biology";
import { ClassificationLab, ScientificMethodSim, MicroscopePartsLab, OnionEpidermisSlideLab, DiffusionDemo, OsmosisSimulation, StarchTestLab as B10StarchTest, ProteinTestLab as B10ProteinTest, LipidTestLab, CO2ProductionTest, BreathingRateInvestigation, TranspirationLab, WaterTransportDye, FlowerDissection, IdentifyingBones, MeasuringPulseRate, ReflexActionDemo, QuadratSampling as B10QuadratSampling } from "./biology/Grade10Biology";
import { CellStructureMicroscope, OsmosisDiffusion, FoodTests11, EnzymeActivity, Photosynthesis, Respiration, PlantTissues, Transpiration, HumanTissues, BloodCells, MonohybridCross, QuadratSampling as B11QuadratSampling } from "./biology/Grade11Biology";
import { RecombinantDNA, MicroorganismObservation, EcosystemSimulation, NaturalSelection, PupilReflexExperiment, ReflexArcSynapse, HormoneCycle, PunnettSquareSimulation } from "./biology/Grade12Biology";

export const simulationRegistry: Record<string, ComponentType> = {
  "p9-1": MeasuringLength3D, "p9-2": BeamBalance3D, "p9-3": TimeMeasurement3D,
  "p9-4": DistanceDisplacement3D, "p9-5": GraphicalMotion3D,
  "p9-6": NewtonsSecondLaw3D, "p9-7": WorkEnergy3D, "p9-8": HookesLaw3D,
  "p9-9": Lever3D, "p9-10": InclinedPlane3D,
  "p9-11": SimplePendulum3D, "p9-12": WaveSimulation3D,
  "p9-13": ThermalExpansion3D, "p9-14": TemperatureMeasurement3D,
  "p10-1": VectorAddition3D, "p10-2": VectorResolution3D, "p10-3": DistanceDisplacement10_3D, "p10-4": AccelerationSim3D,
  "p10-5": StressStrain3D, "p10-6": TorqueEquilibrium3D, "p10-7": CircuitBuilder3D,
  "p10-8": MagneticField3D, "p10-9": Reflection3D, "p10-10": ReflectionRefraction3D,
  "p11-1": BoilingPointAltitude3D, "p11-2": VectorAddition11_3D, "p11-3": FieldDisplacement3D,
  "p11-4": UniformMotion3D, "p11-5": FreeFall3D, "p11-6": ProjectileMotion3D,
  "p11-7": NewtonsSecondLaw11_3D, "p11-8": FrictionExperiment3D, "p11-9": InclinedPlane11_3D,
  "p11-10": HeatConduction3D, "p11-11": Calorimetry3D,
  "p11-12": CoulombsLaw3D, "p11-13": ElectricCircuit3D,
  "p11-14": RadioactiveDecay3D,
  "p12-1": MRISimulation3D, "p12-2": HorizontalProjectile3D, "p12-3": AngledProjectile3D,
  "p12-4": FluidPressureLab3D, "p12-5": ArchimedesPrinciple3D,
  "p12-6": MagneticFieldWire3D, "p12-7": ElectromagneticInduction3D,
  "p12-8": PNJunctionDiode3D, "p12-9": HalfWaveRectifier3D,
  "c9-1": LabSafety, "c9-2": StatesOfMatter, "c9-3": AtomicStructure, "c9-4": ChemicalBonding, "c9-5": ChemicalReactions, "c9-6": ConservationOfMass, "c9-7": SolutionsLab, "c9-8": AcidsBasesLab, "c9-9": MetalsNonMetals,
  "c10-1": CombinationReaction, "c10-2": DecompositionCuCO3, "c10-3": SingleDisplacement, "c10-4": DoubleDisplacement,
  "c10-5": StandardSolution, "c10-6": DilutionLab, "c10-7": SolubilityTemp,
  "c10-8": PHIndicators, "c10-9": AcidMetalReaction, "c10-10": AcidBaseTitration,
  "c10-11": ExoEndothermic, "c10-12": ElectrochemicalCell, "c10-13": ElectrolysisWater,
  "c10-14": ReactivitySeries, "c10-15": MetalExtraction,
  "c10-16": HydrocarbonCombustion, "c10-17": BromineTest,
  "c11-1": CathodeRayTube, "c11-2": RutherfordExperiment, "c11-3": PhotoelectricEffect,
  "c11-4": IonicBondFormation, "c11-5": VSEPRGeometry, "c11-6": MetallicBonding,
  "c11-7": KineticMolecularTheory, "c11-8": BoylesLaw, "c11-9": HeatingCurve,
  "c11-10": ReactionRate, "c11-11": CatalystSimulation,
  "c11-12": ReversibleReaction, "c11-13": LeChatelierPrinciple,
  "c11-14": Esterification, "c11-15": Saponification,
  "c12-1": IndicatorsLab, "c12-2": PHMeterSim, "c12-3": WeakAcidIonization, "c12-4": BufferSolutions, "c12-5": AcidBaseTitration12,
  "c12-6": ElectrolysisMetal, "c12-7": VoltaicCell, "c12-8": HaberProcess, "c12-9": AdditionPolymerization, "c12-10": AirPollutionAcidRain,
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
