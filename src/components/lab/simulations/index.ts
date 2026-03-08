import { ComponentType } from "react";
import { MeasuringLength, NewtonsSecondLaw, PendulumLab, WaveSimulation } from "./physics/Grade9Physics";
import { VectorAddition, AccelerationSim, CircuitBuilder, ReflectionRefraction } from "./physics/Grade10Physics";
import { ProjectileMotion, InclinedPlane, CoulombsLaw, HeatConduction } from "./physics/Grade11Physics";
import { AdvancedProjectile, FluidPressure, MagneticField, DiodeRectifier } from "./physics/Grade12Physics";
import { LabSafety, StatesOfMatter, AtomicStructure, ChemicalReactions, ConservationOfMass } from "./chemistry/Grade9Chemistry";
import { SingleDisplacement, StandardSolution, AcidBaseTitration, PHIndicators } from "./chemistry/Grade10Chemistry";
import { RutherfordExperiment, PhotoelectricEffect, ReactionRate, LeChatelierPrinciple } from "./chemistry/Grade11Chemistry";
import { WeakAcidIonization, BufferSolutions, VoltaicCell, HaberProcess } from "./chemistry/Grade12Chemistry";
import { MicroscopeSimulation, SeedGerminationLab, DichotomousKeyLab, OnionCellObservation, OsmosisExperiment, StarchTestLab, ProteinTestLab, FoodChainBuilder } from "./biology/Grade9Biology";
import { ClassificationLab, ScientificMethodSim, MicroscopePartsLab, OnionEpidermisSlideLab, DiffusionDemo, OsmosisSimulation, StarchTestLab as B10StarchTest, ProteinTestLab as B10ProteinTest, LipidTestLab, CO2ProductionTest, BreathingRateInvestigation, TranspirationLab, WaterTransportDye, FlowerDissection, IdentifyingBones, MeasuringPulseRate, ReflexActionDemo, QuadratSampling } from "./biology/Grade10Biology";
import { EnzymeActivity, Photosynthesis, HumanTissues, MonohybridCross } from "./biology/Grade11Biology";
import { BacterialTransformation, NaturalSelection, ReflexArcSynapse, HormoneCycle } from "./biology/Grade12Biology";

export const simulationRegistry: Record<string, ComponentType> = {
  "p9-1": MeasuringLength, "p9-2": NewtonsSecondLaw, "p9-3": PendulumLab, "p9-4": WaveSimulation,
  "p10-1": VectorAddition, "p10-2": AccelerationSim, "p10-3": CircuitBuilder, "p10-4": ReflectionRefraction,
  "p11-1": ProjectileMotion, "p11-2": InclinedPlane, "p11-3": CoulombsLaw, "p11-4": HeatConduction,
  "p12-1": AdvancedProjectile, "p12-2": FluidPressure, "p12-3": MagneticField, "p12-4": DiodeRectifier,
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
  "b10-18": QuadratSampling,
  "b11-1": EnzymeActivity, "b11-2": Photosynthesis, "b11-3": HumanTissues, "b11-4": MonohybridCross,
  "b12-1": BacterialTransformation, "b12-2": NaturalSelection, "b12-3": ReflexArcSynapse, "b12-4": HormoneCycle,
};
