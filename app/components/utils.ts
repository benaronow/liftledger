import { Block } from "@/types";

export const getTemplateFromBlock = (block: Block, editing: boolean) => {
  const template: Block = editing
    ? block
    : {
        name: block.name,
        startDate: new Date(),
        length: block.length,
        weeks: [
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
                    weightType: exercise.weightType,
                    unilateral: exercise.unilateral,
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

  return template;
};
