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
import { LabSafety3D, StatesOfMatter3D, AtomicStructure3D, ChemicalBonding3D, ChemicalReactions3D } from "./chemistry/Grade9Chemistry3D_Batch1";
import { ConservationOfMass3D, SolutionsLab3D, AcidsBasesLab3D, MetalsNonMetals3D } from "./chemistry/Grade9Chemistry3D_Batch2";
import { CombinationReaction, DecompositionCuCO3, SingleDisplacement, DoubleDisplacement, StandardSolution, DilutionLab, SolubilityTemp, PHIndicators, AcidMetalReaction, AcidBaseTitration, ExoEndothermic, ElectrochemicalCell, ElectrolysisWater, ReactivitySeries, MetalExtraction, HydrocarbonCombustion, BromineTest } from "./chemistry/Grade10Chemistry";
import { CombinationReaction3D, DecompositionCuCO3_3D, SingleDisplacement3D, DoubleDisplacement3D, StandardSolution3D, DilutionLab3D } from "./chemistry/Grade10Chemistry3D_Batch1";
import { SolubilityTemp3D, PHIndicators3D, AcidMetalReaction3D, AcidBaseTitration3D, ExoEndothermic3D } from "./chemistry/Grade10Chemistry3D_Batch2";
import { ElectrochemicalCell3D, ElectrolysisWater3D, ReactivitySeries3D, MetalExtraction3D, HydrocarbonCombustion3D, BromineTest3D } from "./chemistry/Grade10Chemistry3D_Batch3";
import { CathodeRayTube, RutherfordExperiment, PhotoelectricEffect, IonicBondFormation, VSEPRGeometry, MetallicBonding, KineticMolecularTheory, BoylesLaw, HeatingCurve, ReactionRate, CatalystSimulation, ReversibleReaction, LeChatelierPrinciple, Esterification, Saponification } from "./chemistry/Grade11Chemistry";
import { CathodeRayTube3D, RutherfordExperiment3D, PhotoelectricEffect3D, IonicBondFormation3D, VSEPRGeometry3D } from "./chemistry/Grade11Chemistry3D_Batch1";
import { MetallicBonding3D, KineticMolecularTheory3D, BoylesLaw3D, HeatingCurve3D, ReactionRate3D } from "./chemistry/Grade11Chemistry3D_Batch2";
import { CatalystSimulation3D, ReversibleReaction3D, LeChatelierPrinciple3D, Esterification3D, Saponification3D } from "./chemistry/Grade11Chemistry3D_Batch3";
import { IndicatorsLab, PHMeterSim, WeakAcidIonization, BufferSolutions, AcidBaseTitration as AcidBaseTitration12, ElectrolysisMetal, VoltaicCell, HaberProcess, AdditionPolymerization, AirPollutionAcidRain } from "./chemistry/Grade12Chemistry";
import { IndicatorsLab3D, PHMeterSim3D, WeakAcidIonization3D, BufferSolutions3D, AcidBaseTitration3D as AcidBaseTitration12_3D } from "./chemistry/Grade12Chemistry3D_Batch1";
import { ElectrolysisMetal3D, VoltaicCell3D, HaberProcess3D, AdditionPolymerization3D, AirPollutionAcidRain3D } from "./chemistry/Grade12Chemistry3D_Batch2";
import { MicroscopeSimulation, SeedGerminationLab, DichotomousKeyLab, OnionCellObservation, OsmosisExperiment, StarchTestLab, ProteinTestLab, FoodChainBuilder } from "./biology/Grade9Biology";
import { MicroscopeSimulation3D, SeedGerminationLab3D, DichotomousKeyLab3D, OnionCellObservation3D } from "./biology/Grade9Biology3D_Batch1";
import { OsmosisExperiment3D, StarchTestLab3D, ProteinTestLab3D, FoodChainBuilder3D } from "./biology/Grade9Biology3D_Batch2";
import { ClassificationLab, ScientificMethodSim, MicroscopePartsLab, OnionEpidermisSlideLab, DiffusionDemo, OsmosisSimulation, StarchTestLab as B10StarchTest, ProteinTestLab as B10ProteinTest, LipidTestLab, CO2ProductionTest, BreathingRateInvestigation, TranspirationLab, WaterTransportDye, FlowerDissection, IdentifyingBones, MeasuringPulseRate, ReflexActionDemo, QuadratSampling as B10QuadratSampling } from "./biology/Grade10Biology";
import { ClassificationLab3D, ScientificMethodSim3D, MicroscopePartsLab3D, OnionEpidermisSlideLab3D, DiffusionDemo3D, OsmosisSimulation3D } from "./biology/Grade10Biology3D_Batch1";
import { StarchTestLab3D as B10StarchTest3D, ProteinTestLab3D as B10ProteinTest3D, LipidTestLab3D, CO2ProductionTest3D, BreathingRateInvestigation3D, TranspirationLab3D } from "./biology/Grade10Biology3D_Batch2";
import { WaterTransportDye3D, FlowerDissection3D, IdentifyingBones3D, MeasuringPulseRate3D, ReflexActionDemo3D, QuadratSampling3D as B10QuadratSampling3D } from "./biology/Grade10Biology3D_Batch3";
import { CellStructureMicroscope, OsmosisDiffusion, FoodTests11, EnzymeActivity, Photosynthesis, Respiration, PlantTissues, Transpiration, HumanTissues, BloodCells, MonohybridCross, QuadratSampling as B11QuadratSampling } from "./biology/Grade11Biology";
import { CellStructureMicroscope3D, OsmosisDiffusion3D, FoodTests3D, EnzymeActivity3D } from "./biology/Grade11Biology3D_Batch1";
import { Photosynthesis3D, Respiration3D, PlantTissues3D, Transpiration3D } from "./biology/Grade11Biology3D_Batch2";
import { HumanTissues3D, BloodCells3D, MonohybridCross3D, QuadratSampling3D as B11QuadratSampling3D } from "./biology/Grade11Biology3D_Batch3";
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
  "c9-1": LabSafety3D, "c9-2": StatesOfMatter3D, "c9-3": AtomicStructure3D, "c9-4": ChemicalBonding3D, "c9-5": ChemicalReactions3D, "c9-6": ConservationOfMass3D, "c9-7": SolutionsLab3D, "c9-8": AcidsBasesLab3D, "c9-9": MetalsNonMetals3D,
  "c10-1": CombinationReaction3D, "c10-2": DecompositionCuCO3_3D, "c10-3": SingleDisplacement3D, "c10-4": DoubleDisplacement3D,
  "c10-5": StandardSolution3D, "c10-6": DilutionLab3D, "c10-7": SolubilityTemp3D,
  "c10-8": PHIndicators3D, "c10-9": AcidMetalReaction3D, "c10-10": AcidBaseTitration3D,
  "c10-11": ExoEndothermic3D, "c10-12": ElectrochemicalCell3D, "c10-13": ElectrolysisWater3D,
  "c10-14": ReactivitySeries3D, "c10-15": MetalExtraction3D,
  "c10-16": HydrocarbonCombustion3D, "c10-17": BromineTest3D,
  "c11-1": CathodeRayTube3D, "c11-2": RutherfordExperiment3D, "c11-3": PhotoelectricEffect3D,
  "c11-4": IonicBondFormation3D, "c11-5": VSEPRGeometry3D, "c11-6": MetallicBonding3D,
  "c11-7": KineticMolecularTheory3D, "c11-8": BoylesLaw3D, "c11-9": HeatingCurve3D,
  "c11-10": ReactionRate3D, "c11-11": CatalystSimulation3D,
  "c11-12": ReversibleReaction3D, "c11-13": LeChatelierPrinciple3D,
  "c11-14": Esterification3D, "c11-15": Saponification3D,
  "c12-1": IndicatorsLab3D, "c12-2": PHMeterSim3D, "c12-3": WeakAcidIonization3D, "c12-4": BufferSolutions3D, "c12-5": AcidBaseTitration12_3D,
  "c12-6": ElectrolysisMetal3D, "c12-7": VoltaicCell3D, "c12-8": HaberProcess3D, "c12-9": AdditionPolymerization3D, "c12-10": AirPollutionAcidRain3D,
  "b9-1": MicroscopeSimulation3D, "b9-2": SeedGerminationLab3D, "b9-3": DichotomousKeyLab3D,
  "b9-4": OnionCellObservation3D, "b9-5": OsmosisExperiment3D,
  "b9-6": StarchTestLab3D, "b9-7": ProteinTestLab3D, "b9-8": FoodChainBuilder3D,
  "b10-1": ClassificationLab3D, "b10-2": ScientificMethodSim3D,
  "b10-3": MicroscopePartsLab3D, "b10-4": OnionEpidermisSlideLab3D, "b10-5": DiffusionDemo3D, "b10-6": OsmosisSimulation3D,
  "b10-7": B10StarchTest3D, "b10-8": B10ProteinTest3D, "b10-9": LipidTestLab3D,
  "b10-10": CO2ProductionTest3D, "b10-11": BreathingRateInvestigation3D,
  "b10-12": TranspirationLab3D, "b10-13": WaterTransportDye3D,
  "b10-14": FlowerDissection3D,
  "b10-15": IdentifyingBones3D,
  "b10-16": MeasuringPulseRate3D,
  "b10-17": ReflexActionDemo3D,
  "b10-18": B10QuadratSampling3D,
  "b11-1": CellStructureMicroscope, "b11-2": OsmosisDiffusion, "b11-3": FoodTests11, "b11-4": EnzymeActivity,
  "b11-5": Photosynthesis, "b11-6": Respiration, "b11-7": PlantTissues, "b11-8": Transpiration,
  "b11-9": HumanTissues, "b11-10": BloodCells, "b11-11": MonohybridCross, "b11-12": B11QuadratSampling,
  "b12-1": RecombinantDNA, "b12-2": MicroorganismObservation, "b12-3": EcosystemSimulation, "b12-4": NaturalSelection,
  "b12-5": PupilReflexExperiment, "b12-6": ReflexArcSynapse, "b12-7": HormoneCycle, "b12-8": PunnettSquareSimulation,
};
