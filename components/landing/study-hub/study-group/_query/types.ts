export type StudyGroup = {
    createdAt: string;
    description: string;
    groupName: string;
    maxMembers: number;
    id: number;
    study_group_members: { id: number; name: string; email: string }[];
    subject: string;
    alreadyRequested?: boolean;
};
