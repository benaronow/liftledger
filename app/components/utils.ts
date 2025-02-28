import { Block } from "@/types";

export const getTemplateFromBlock = (block: Block, editing: boolean) => {
  return {
    name: block.name,
    startDate: editing ? block.startDate : new Date(),
    length: block.length,
    weeks: editing
      ? block.weeks
      : [
          {
            number: 1,
            days: block.weeks[block.length - 1].days.map((day) => {
              return {
                name: day.name,
                hasGroup: day.hasGroup,
                groupName: day.groupName,
                exercises: day.exercises.map((exercise) => {
                  return {
                    name: exercise.name,
                    apparatus: exercise.apparatus,
                    sets: exercise.sets,
                    reps: exercise.reps,
                    weight: exercise.weight,
                    weightType: exercise.weightType,
                    unilateral: exercise.unilateral,
                    note: "",
                    completed: false,
                  };
                }),
                completed: false,
                completedDate: undefined,
              };
            }),
            completed: false,
          },
        ],
    completed: false,
  };
};
