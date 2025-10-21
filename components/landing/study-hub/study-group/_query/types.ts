export type StudyGroup = {
    createdAt: string;
    description: string;
    groupName: string;
    id: number;
    study_group_members: { id: number; name: string; email: string }[];
    subject: string;
};
