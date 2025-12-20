import { SessionContext } from "@/app/_layout";
import DropdownSelect from "@/components/DropDownSelect";
import TimePickerInput from "@/components/TimePickerInput";
import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@react-navigation/native";
import React, { useContext, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Keyboard,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from "react-native";

export default function ProgressIndex() {
    const theme = useTheme();

    // Modal states (goal create/edit)
    const [isModalVisible, setModalVisible] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    // Goal states
    const [goals, setGoals] = useState<any[]>([]);
    const [title, setTitle] = useState("");
    const [subject, setSubject] = useState("");
    const [dueDate, setDueDate] = useState("");
    const [targetGrade, setTargetGrade] = useState("");
    const [editingGoalId, setEditingGoalId] = useState<string | null>(null);

    const session = useContext(SessionContext);
    const user = session?.user ?? null;

    // General
    const [loading, setLoading] = useState(false);

    // Tasks view
    const [showingTasks, setShowingTasks] = useState(false);
    const [selectedGoal, setSelectedGoal] = useState<any | null>(null);
    const [tasks, setTasks] = useState<any[]>([]);
    const [taskLoading, setTaskLoading] = useState(false);

    // Task modal (add)
    const [isTaskModalVisible, setTaskModalVisible] = useState(false);
    const [description, setDescription] = useState("");
    const [priority, setPriority] = useState<"Low" | "Medium" | "High">("Low");
    const [hours, setHours] = useState("1");

    // Focus timer states
    const [focusTask, setFocusTask] = useState<any | null>(null);
    const [isTimerRunning, setIsTimerRunning] = useState(false);
    const [focusSeconds, setFocusSeconds] = useState(0);
    const [timerInterval, setTimerInterval] = useState<ReturnType<
        typeof setInterval
    > | null>(null);

    // Start timer for a task
    const handleStartFocus = (task: any) => {
        setFocusTask(task);
        setIsTimerRunning(true);
        const interval = setInterval(() => {
            setFocusSeconds((prev) => prev + 1);
        }, 1000);
        setTimerInterval(interval);
    };

    // Pause timer
    const handlePauseFocus = () => {
        if (timerInterval) clearInterval(timerInterval);
        setIsTimerRunning(false);
    };

    // Stop timer
    const handleStopFocus = () => {
        if (timerInterval) clearInterval(timerInterval);
        setIsTimerRunning(false);
        setTimerInterval(null);
        setFocusTask(null);
        setFocusSeconds(0);
    };

    // Tabs (Exam / Weekly)
    const [activeTab, setActiveTab] = useState<"Exam" | "Weekly">("Exam");

    const [weeklyData, setWeeklyData] = useState<
        { day: string; studied: number; target: number }[]
    >([]);

    useEffect(() => {
        const fetchWeeklyStudy = async () => {
            try {
                const { data: tasks, error } = await supabase
                    .from("tasks")
                    .select("id, estimated_hours, completed, updated_at")
                    .eq("user_id", user?.id)
                    .eq("completed", true)
                    .gte(
                        "updated_at",
                        new Date(
                            new Date().setDate(new Date().getDate() - 7)
                        ).toISOString()
                    );

                if (error) throw error;

                // initialize map for each weekday
                const dayMap: Record<string, number> = {
                    Mon: 0,
                    Tue: 0,
                    Wed: 0,
                    Thu: 0,
                    Fri: 0,
                    Sat: 0,
                    Sun: 0,
                };

                // aggregate total hours per weekday
                tasks?.forEach((t) => {
                    const d = new Date(t.updated_at);
                    const day = [
                        "Sun",
                        "Mon",
                        "Tue",
                        "Wed",
                        "Thu",
                        "Fri",
                        "Sat",
                    ][d.getDay()];
                    dayMap[day] += Number(t.estimated_hours || 0);
                });

                // create ordered array Mon–Sun
                const orderedDays = [
                    "Mon",
                    "Tue",
                    "Wed",
                    "Thu",
                    "Fri",
                    "Sat",
                    "Sun",
                ];
                const result = orderedDays.map((day) => ({
                    day,
                    studied: dayMap[day],
                    target: 4, // target hours per day (you can adjust or make dynamic)
                }));

                setWeeklyData(result);
            } catch (err) {
                console.error("Error loading weekly study data:", err);
            }
        };

        if (user) fetchWeeklyStudy();
    }, [user, tasks]);

    useEffect(() => {
        fetchGoals();
    }, [tasks]);

    // Fetch goals
    const fetchGoals = async () => {
        try {
            setLoading(true);
            const {
                data: { user },
            } = await supabase.auth.getUser();

            if (!user) {
                console.warn("No user logged in");
                return;
            }

            // Fetch goals and include tasks' completion state
            const { data, error } = await supabase
                .from("goals")
                .select(
                    `
                *,
                tasks (
                    id,
                    completed
                )
            `
                )
                .eq("user_id", user.id)
                .order("created_at", { ascending: false });

            if (error) throw error;

            // Compute completed and total tasks count for each goal
            const goalsWithCounts = (data || []).map((goal) => {
                const completedCount =
                    goal.tasks?.filter((t) => t.completed).length || 0;
                const totalCount = goal.tasks?.length || 0;

                return {
                    ...goal,
                    completed_tasks: completedCount,
                    total_tasks: totalCount,
                };
            });

            setGoals(goalsWithCounts);
        } catch (err) {
            console.error("Error fetching goals:", err);
        } finally {
            setLoading(false);
        }
    };

    // Fetch tasks for a goal
    const fetchTasks = async (goalId: string) => {
        try {
            setTaskLoading(true);
            const {
                data: { user },
            } = await supabase.auth.getUser();
            if (!user) return;

            const { data, error } = await supabase
                .from("tasks")
                .select("*")
                .eq("goal_id", goalId)
                .eq("user_id", user.id)
                .order("created_at", { ascending: true });

            if (error) throw error;
            setTasks(data || []);
        } catch (err) {
            console.error("Error fetching tasks:", err);
        } finally {
            setTaskLoading(false);
        }
    };

    // Open goal modal (create or edit) — exact logic preserved
    const handleOpenModal = (goal?: any) => {
        if (goal) {
            setIsEditing(true);
            setEditingGoalId(goal.id);
            setTitle(goal.title);
            setSubject(goal.subject);
            setDueDate(goal.due_date ? goal.due_date : "");
            setTargetGrade(goal.target_grade ? goal.target_grade : "");
        } else {
            setIsEditing(false);
            setEditingGoalId(null);
            setTitle("");
            setSubject("");
            setDueDate("");
            setTargetGrade("");
        }
        setModalVisible(true);
    };

    // Save goal (create or update) — kept same as your original
    const handleSaveGoal = async () => {
        setLoading(true);
        try {
            const {
                data: { user },
            } = await supabase.auth.getUser();

            if (!user) {
                alert("Please log in first");
                return;
            }

            if (isEditing && editingGoalId) {
                // Update existing goal
                const { error } = await supabase
                    .from("goals")
                    .update({
                        title,
                        subject,
                        due_date: dueDate || null,
                        target_grade: targetGrade || null,
                        updated_at: new Date().toISOString(),
                    })
                    .eq("id", editingGoalId);

                if (error) throw error;

                // If the edited goal is currently selected, refresh it
                if (showingTasks && selectedGoal?.id === editingGoalId) {
                    await fetchGoals();
                    const fresh = (
                        await supabase
                            .from("goals")
                            .select("*")
                            .eq("id", editingGoalId)
                            .single()
                    ).data;
                    setSelectedGoal(fresh || selectedGoal);
                }
            } else {
                // Create new goal
                const { error } = await supabase.from("goals").insert([
                    {
                        user_id: (await supabase.auth.getUser()).data.user?.id,
                        title,
                        subject,
                        due_date: dueDate || null,
                        target_grade: targetGrade || null,
                        progress: 0,
                    },
                ]);

                if (error) throw error;
            }

            await fetchGoals();
        } catch (err) {
            console.error("Error saving goal:", err);
        } finally {
            setLoading(false);
            setModalVisible(false);
        }
    };

    // Delete goal
    const handleDeleteGoal = (id: string) => {
        Alert.alert(
            "Delete Goal",
            "Are you sure you want to delete this goal? This action cannot be undone.",
            [
                {
                    text: "Cancel",
                    style: "cancel",
                },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await supabase.from("goals").delete().eq("id", id);
                            // if we deleted the selected goal, go back to goals view
                            if (selectedGoal?.id === id) {
                                setSelectedGoal(null);
                                setShowingTasks(false);
                                setTasks([]);
                            }
                            await fetchGoals();
                        } catch (err) {
                            console.error("Error deleting goal:", err);
                        }
                    },
                },
            ]
        );
    };

    // Select a goal -> show tasks (no navigation)
    const handleSelectGoal = (goal: any) => {
        setSelectedGoal(goal);
        setShowingTasks(true);
        fetchTasks(goal.id);
    };

    // Back to goals list
    const handleBackToGoals = () => {
        setShowingTasks(false);
        setSelectedGoal(null);
        setTasks([]);
    };

    // === TASK HANDLERS ===
    const handleAddTask = async () => {
        try {
            const {
                data: { user },
            } = await supabase.auth.getUser();
            if (!user || !selectedGoal) return;

            const { error } = await supabase.from("tasks").insert([
                {
                    goal_id: selectedGoal.id,
                    user_id: user.id,
                    description,
                    priority,
                    estimated_hours: Number(hours) || 1,
                    completed: false,
                    progress: 0,
                },
            ]);

            if (error) throw error;

            setTaskModalVisible(false);
            setDescription("");
            setPriority("Low");
            setHours("1");
            await fetchTasks(selectedGoal.id);
        } catch (err) {
            console.error("Error adding task:", err);
        }
    };

    const handleDeleteTask = (id: string) => {
        Alert.alert(
            "Delete Task",
            "Are you sure you want to delete this task?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await supabase.from("tasks").delete().eq("id", id);
                            await fetchTasks(selectedGoal!.id);
                        } catch (err) {
                            console.error("Error deleting task:", err);
                        }
                    },
                },
            ]
        );
    };

    const toggleTaskComplete = async (task: any) => {
        try {
            // 1️⃣ Toggle completion for this task
            const newCompleted = !task.completed;

            const { error: updateError } = await supabase
                .from("tasks")
                .update({
                    completed: newCompleted,
                    updated_at: new Date().toISOString(),
                })
                .eq("id", task.id);

            if (updateError) throw updateError;

            // 2️⃣ Fetch all tasks for the same goal
            const { data: goalTasks, error: fetchError } = await supabase
                .from("tasks")
                .select("id, completed")
                .eq("goal_id", task.goal_id)
                .eq("user_id", user?.id);

            if (fetchError) throw fetchError;

            if (!goalTasks || goalTasks.length === 0) return;

            // 3️⃣ Compute new progress (percentage of completed tasks)
            const total = goalTasks.length;
            const completedCount = goalTasks.filter((t) => t.completed).length;
            const newProgress = Math.round((completedCount / total) * 100);

            // 4️⃣ Update goal progress
            const { error: goalError } = await supabase
                .from("goals")
                .update({
                    progress: newProgress,
                    updated_at: new Date().toISOString(),
                })
                .eq("id", task.goal_id)
                .eq("user_id", user?.id);

            if (goalError) throw goalError;

            // 5️⃣ Refresh tasks and goal UI
            await fetchTasks(selectedGoal!.id);
        } catch (err) {
            console.error("Error toggling task:", err);
        }
    };

    // Stats
    // Compute overall totals across all goals
    const totalCompletedTasks = goals.reduce(
        (sum, g) => sum + (g.completed_tasks || 0),
        0
    );
    const totalTasks = goals.reduce((sum, g) => sum + (g.total_tasks || 0), 0);

    const overallPercent = totalTasks
        ? Math.round((totalCompletedTasks / totalTasks) * 100)
        : 0;

    return (
        <View
            style={{
                flex: 1,
                backgroundColor: theme.colors.background,
                paddingHorizontal: 16,
                paddingTop: 20,
            }}
        >
            {/* Header */}
            <View
                style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 20,
                }}
            >
                {/* Left */}
                <View style={{ flexShrink: 1, paddingRight: 10 }}>
                    <Text
                        style={{
                            fontSize: 20,
                            fontWeight: "600",
                            color: theme.colors.text,
                        }}
                    >
                        Progress Tracker
                    </Text>
                    <Text
                        style={{
                            color: theme.colors.text,
                            opacity: 0.6,
                            fontSize: 14,
                            flexWrap: "wrap",
                        }}
                    >
                        Monitor your learning journey and exam goals
                    </Text>
                </View>

                {/* Right: New Goal / Add Task */}
                <TouchableOpacity
                    style={{
                        backgroundColor: theme.colors.text,
                        paddingVertical: 8,
                        paddingHorizontal: 14,
                        borderRadius: 8,
                        flexDirection: "row",
                        alignItems: "center",
                    }}
                    onPress={() => handleOpenModal()}
                >
                    <Ionicons
                        name="add"
                        size={20}
                        color={theme.colors.background}
                    />
                    <Text
                        style={{
                            color: theme.colors.background,
                            marginLeft: 4,
                            fontWeight: "600",
                        }}
                    >
                        New Goal
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Stats Section */}
            <View
                style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    marginBottom: 16,
                }}
            >
                <View
                    style={{
                        flex: 1,
                        marginRight: 8,
                        backgroundColor: theme.colors.card,
                        borderRadius: 12,
                        padding: 12,
                        alignItems: "center",
                    }}
                >
                    <Text
                        style={{
                            color: theme.colors.text,
                            fontSize: 16,
                            fontWeight: "600",
                        }}
                    >
                        {goals.length}
                    </Text>
                    <Text
                        style={{
                            color: theme.colors.text,
                            opacity: 0.6,
                            fontSize: 12,
                        }}
                    >
                        Active Goals
                    </Text>
                </View>

                <View
                    style={{
                        flex: 1,
                        marginLeft: 8,
                        backgroundColor: theme.colors.card,
                        borderRadius: 12,
                        padding: 12,
                        alignItems: "center",
                    }}
                >
                    <Text
                        style={{
                            color: theme.colors.text,
                            fontSize: 16,
                            fontWeight: "600",
                        }}
                    >
                        {totalCompletedTasks}/{totalTasks}
                    </Text>
                    <Text
                        style={{
                            color: theme.colors.text,
                            opacity: 0.6,
                            fontSize: 12,
                        }}
                    >
                        Tasks Done ({overallPercent}%)
                    </Text>
                </View>
            </View>

            {focusTask && (
                <View
                    style={{
                        backgroundColor: theme.colors.card,
                        borderRadius: 14,
                        padding: 16,
                        marginBottom: 12,
                    }}
                >
                    <Text
                        style={{
                            color: theme.colors.text,
                            fontWeight: "600",
                            fontSize: 14,
                            marginBottom: 8,
                        }}
                    >
                        Focus Time: {focusTask.description}
                    </Text>

                    <Text
                        style={{
                            color: theme.colors.text,
                            fontSize: 20,
                            fontWeight: "700",
                            textAlign: "center",
                            marginBottom: 8,
                        }}
                    >
                        {Math.floor(focusSeconds / 3600)
                            .toString()
                            .padStart(2, "0")}
                        :
                        {Math.floor((focusSeconds % 3600) / 60)
                            .toString()
                            .padStart(2, "0")}
                        :{(focusSeconds % 60).toString().padStart(2, "0")}
                    </Text>

                    <View
                        style={{
                            flexDirection: "row",
                            justifyContent: "space-around",
                        }}
                    >
                        {isTimerRunning ? (
                            <TouchableOpacity
                                onPress={handlePauseFocus}
                                style={{
                                    backgroundColor: theme.colors.text,
                                    paddingVertical: 10,
                                    paddingHorizontal: 20,
                                    borderRadius: 8,
                                }}
                            >
                                <Text
                                    style={{
                                        color: theme.colors.background,
                                        fontWeight: "600",
                                    }}
                                >
                                    Pause
                                </Text>
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity
                                onPress={() => handleStartFocus(focusTask)}
                                style={{
                                    backgroundColor: theme.colors.text,
                                    paddingVertical: 10,
                                    paddingHorizontal: 20,
                                    borderRadius: 8,
                                }}
                            >
                                <Text
                                    style={{
                                        color: theme.colors.background,
                                        fontWeight: "600",
                                    }}
                                >
                                    Resume
                                </Text>
                            </TouchableOpacity>
                        )}
                        <TouchableOpacity
                            onPress={handleStopFocus}
                            style={{
                                backgroundColor: theme.colors.card,
                                borderWidth: 1,
                                borderColor: theme.colors.text,
                                paddingVertical: 10,
                                paddingHorizontal: 20,
                                borderRadius: 8,
                            }}
                        >
                            <Text
                                style={{
                                    color: theme.colors.text,
                                    fontWeight: "600",
                                }}
                            >
                                Stop
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}

            {/* Tabs */}
            <View
                style={{
                    flexDirection: "row",
                    backgroundColor: theme.colors.card,
                    borderRadius: 8,
                    marginBottom: 16,
                }}
            >
                <TouchableOpacity
                    style={{
                        flex: 1,
                        backgroundColor:
                            activeTab === "Exam"
                                ? theme.colors.text
                                : "transparent",
                        borderRadius: 8,
                        alignItems: "center",
                        padding: 8,
                    }}
                    onPress={() => setActiveTab("Exam")}
                >
                    <Text
                        style={{
                            color:
                                activeTab === "Exam"
                                    ? theme.colors.background
                                    : theme.colors.text,
                            fontWeight: "600",
                        }}
                    >
                        Exam Goals
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={{
                        flex: 1,
                        alignItems: "center",
                        padding: 8,
                        backgroundColor:
                            activeTab === "Weekly"
                                ? theme.colors.text
                                : "transparent",
                        borderRadius: 8,
                    }}
                    onPress={() => setActiveTab("Weekly")}
                >
                    <Text
                        style={{
                            fontWeight: "600",
                            color:
                                activeTab === "Weekly"
                                    ? theme.colors.background
                                    : theme.colors.text,
                        }}
                    >
                        Weekly
                    </Text>
                </TouchableOpacity>
            </View>

            {/* MAIN CONTENT */}
            {activeTab === "Exam" ? (
                <>
                    {loading ? (
                        <ActivityIndicator
                            color={theme.colors.text}
                            style={{ marginTop: 40 }}
                        />
                    ) : showingTasks ? (
                        // TASKS VIEW
                        <View style={{ flex: 1 }}>
                            <View style={{ flex: 1 }}>
                                <TouchableOpacity
                                    onPress={handleBackToGoals}
                                    style={{
                                        flexDirection: "row",
                                        alignItems: "center",
                                        marginBottom: 10,
                                    }}
                                >
                                    <Ionicons
                                        name="chevron-back"
                                        size={22}
                                        color={theme.colors.text}
                                    />
                                    <Text
                                        style={{
                                            color: theme.colors.text,
                                            fontWeight: "600",
                                            marginLeft: 6,
                                        }}
                                    >
                                        Back to Goals
                                    </Text>
                                </TouchableOpacity>

                                {/* Header with Add Task button */}
                                <View
                                    style={{
                                        flexDirection: "row",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        marginBottom: 10,
                                        backgroundColor: theme.colors.card,
                                        borderRadius: 12,
                                        paddingHorizontal: 12,
                                        paddingVertical: 10,
                                    }}
                                >
                                    <Text
                                        style={{
                                            fontSize: 16,
                                            fontWeight: "600",
                                            color: theme.colors.text,
                                        }}
                                    >
                                        Tasks for {selectedGoal?.title}
                                    </Text>

                                    <TouchableOpacity
                                        style={{
                                            backgroundColor: theme.colors.text,
                                            paddingVertical: 6,
                                            paddingHorizontal: 12,
                                            borderRadius: 8,
                                            flexDirection: "row",
                                            alignItems: "center",
                                        }}
                                        onPress={() =>
                                            setTaskModalVisible(true)
                                        }
                                    >
                                        <Ionicons
                                            name="add"
                                            size={18}
                                            color={theme.colors.background}
                                        />
                                        <Text
                                            style={{
                                                color: theme.colors.background,
                                                fontWeight: "600",
                                                marginLeft: 4,
                                            }}
                                        >
                                            Add Task
                                        </Text>
                                    </TouchableOpacity>
                                </View>

                                {/* Task list */}
                                {taskLoading ? (
                                    <ActivityIndicator
                                        color={theme.colors.text}
                                        style={{ marginTop: 20 }}
                                    />
                                ) : tasks.length === 0 ? (
                                    <Text
                                        style={{
                                            color: theme.colors.text,
                                            opacity: 0.6,
                                            textAlign: "center",
                                            marginTop: 40,
                                        }}
                                    >
                                        No tasks yet. Tap &quot;Add Task&quot;
                                        to create one!
                                    </Text>
                                ) : (
                                    <ScrollView
                                        showsVerticalScrollIndicator={false}
                                    >
                                        {tasks.map((task) => (
                                            <View
                                                key={task.id}
                                                style={{
                                                    backgroundColor:
                                                        theme.colors.card,
                                                    borderRadius: 14,
                                                    padding: 14,
                                                    marginBottom: 10,
                                                    borderWidth: 1,
                                                    borderColor:
                                                        theme.colors.border,
                                                    flexDirection: "row",
                                                    alignItems: "center",
                                                }}
                                            >
                                                {/* Checkbox */}
                                                <TouchableOpacity
                                                    onPress={() =>
                                                        toggleTaskComplete(task)
                                                    }
                                                    style={{
                                                        width: 26,
                                                        height: 26,
                                                        borderRadius: 6,
                                                        borderWidth: 2,
                                                        borderColor:
                                                            theme.colors.text,
                                                        justifyContent:
                                                            "center",
                                                        alignItems: "center",
                                                        marginRight: 12,
                                                        backgroundColor:
                                                            task.completed
                                                                ? theme.colors
                                                                      .text
                                                                : "transparent",
                                                    }}
                                                >
                                                    {task.completed && (
                                                        <Ionicons
                                                            name="checkmark"
                                                            size={16}
                                                            color={
                                                                theme.colors
                                                                    .background
                                                            }
                                                        />
                                                    )}
                                                </TouchableOpacity>

                                                {/* Main Content */}
                                                <View style={{ flex: 1 }}>
                                                    <Text
                                                        style={{
                                                            color: theme.colors
                                                                .text,
                                                            fontSize: 15,
                                                            fontWeight: "500",
                                                            textDecorationLine:
                                                                task.completed
                                                                    ? "line-through"
                                                                    : "none",
                                                        }}
                                                    >
                                                        {task.description}
                                                    </Text>
                                                    <View
                                                        style={{
                                                            flexDirection:
                                                                "row",
                                                            alignItems:
                                                                "center",
                                                            marginTop: 4,
                                                        }}
                                                    >
                                                        <Text
                                                            style={{
                                                                color: theme
                                                                    .colors
                                                                    .text,
                                                                opacity: 0.6,
                                                                fontSize: 12,
                                                                marginRight: 8,
                                                            }}
                                                        >
                                                            {task.priority}{" "}
                                                            Priority
                                                        </Text>
                                                        <Ionicons
                                                            name="time-outline"
                                                            size={12}
                                                            color={
                                                                theme.colors
                                                                    .text + "80"
                                                            }
                                                            style={{
                                                                marginRight: 4,
                                                            }}
                                                        />
                                                        <Text
                                                            style={{
                                                                color: theme
                                                                    .colors
                                                                    .text,
                                                                opacity: 0.6,
                                                                fontSize: 12,
                                                            }}
                                                        >
                                                            {
                                                                task.estimated_hours
                                                            }{" "}
                                                            Hour
                                                            {task.estimated_hours >
                                                            1
                                                                ? "s"
                                                                : ""}
                                                        </Text>
                                                    </View>
                                                </View>

                                                {/* Action Buttons */}
                                                <View
                                                    style={{
                                                        flexDirection: "row",
                                                        alignItems: "center",
                                                        marginLeft: 8,
                                                    }}
                                                >
                                                    <TouchableOpacity
                                                        style={{
                                                            marginRight: 12,
                                                        }}
                                                        onPress={() =>
                                                            handleStartFocus(
                                                                task
                                                            )
                                                        }
                                                    >
                                                        <Ionicons
                                                            name="play-circle-outline"
                                                            size={22}
                                                            color={
                                                                theme.colors
                                                                    .text
                                                            }
                                                        />
                                                    </TouchableOpacity>
                                                    <TouchableOpacity
                                                        onPress={() =>
                                                            handleDeleteTask(
                                                                task.id
                                                            )
                                                        }
                                                    >
                                                        <Ionicons
                                                            name="trash-outline"
                                                            size={20}
                                                            color={
                                                                theme.colors
                                                                    .text
                                                            }
                                                        />
                                                    </TouchableOpacity>
                                                </View>
                                            </View>
                                        ))}
                                    </ScrollView>
                                )}
                            </View>
                        </View>
                    ) : (
                        // GOALS VIEW
                        <ScrollView showsVerticalScrollIndicator={false}>
                            {goals.length === 0 ? (
                                <Text
                                    style={{
                                        color: theme.colors.text,
                                        opacity: 0.6,
                                        textAlign: "center",
                                        marginTop: 40,
                                    }}
                                >
                                    No goals yet. Tap &quot;New Goal&quot; to
                                    create one!
                                </Text>
                            ) : (
                                goals.map((goal) => (
                                    <View
                                        key={goal.id}
                                        style={{
                                            backgroundColor: theme.colors.card,
                                            borderRadius: 12,
                                            padding: 16,
                                            marginBottom: 12,
                                            borderWidth: 1,
                                            borderColor: theme.colors.border,
                                        }}
                                    >
                                        <View
                                            style={{
                                                flexDirection: "row",
                                                justifyContent: "space-between",
                                                alignItems: "center",
                                                marginBottom: 8,
                                            }}
                                        >
                                            <Text
                                                style={{
                                                    color: theme.colors.text,
                                                    fontSize: 16,
                                                    fontWeight: "600",
                                                }}
                                            >
                                                {goal.title}
                                            </Text>
                                            <Text
                                                style={{
                                                    backgroundColor:
                                                        theme.colors.border,
                                                    color: theme.colors.text,
                                                    borderRadius: 6,
                                                    paddingHorizontal: 8,
                                                    paddingVertical: 2,
                                                    fontSize: 12,
                                                }}
                                            >
                                                {goal.due_date
                                                    ? `Due ${goal.due_date}`
                                                    : "No due date"}
                                            </Text>
                                        </View>

                                        <Text
                                            style={{
                                                color: theme.colors.text,
                                                opacity: 0.6,
                                                fontSize: 13,
                                                marginBottom: 8,
                                            }}
                                        >
                                            {goal.subject}
                                        </Text>

                                        <Text
                                            style={{
                                                color: theme.colors.text,
                                                fontWeight: "500",
                                                fontSize: 13,
                                                marginBottom: 4,
                                            }}
                                        >
                                            Progress: {goal.progress || 0}%
                                        </Text>

                                        <View
                                            style={{
                                                height: 6,
                                                borderRadius: 4,
                                                backgroundColor:
                                                    theme.colors.border,
                                                marginBottom: 8,
                                            }}
                                        >
                                            <View
                                                style={{
                                                    height: 6,
                                                    borderRadius: 4,
                                                    width: `${
                                                        goal.progress || 0
                                                    }%`,
                                                    backgroundColor:
                                                        theme.colors.text,
                                                }}
                                            />
                                        </View>

                                        <View
                                            style={{
                                                flexDirection: "row",
                                                justifyContent: "space-between",
                                                marginTop: 8,
                                            }}
                                        >
                                            <TouchableOpacity
                                                onPress={() =>
                                                    handleSelectGoal(goal)
                                                }
                                                style={{
                                                    flexDirection: "row",
                                                    alignItems: "center",
                                                }}
                                            >
                                                <Ionicons
                                                    name="list-outline"
                                                    color={theme.colors.text}
                                                    size={18}
                                                />
                                                <Text
                                                    style={{
                                                        color: theme.colors
                                                            .text,
                                                        marginLeft: 4,
                                                    }}
                                                >
                                                    View Tasks
                                                </Text>
                                            </TouchableOpacity>

                                            <View
                                                style={{
                                                    flexDirection: "row",
                                                    gap: 12,
                                                }}
                                            >
                                                <TouchableOpacity
                                                    onPress={() =>
                                                        handleOpenModal(goal)
                                                    }
                                                >
                                                    <Ionicons
                                                        name="create-outline"
                                                        size={20}
                                                        color={
                                                            theme.colors.text
                                                        }
                                                    />
                                                </TouchableOpacity>
                                                <TouchableOpacity
                                                    onPress={() =>
                                                        handleDeleteGoal(
                                                            goal.id
                                                        )
                                                    }
                                                >
                                                    <Ionicons
                                                        name="trash-outline"
                                                        size={20}
                                                        color={
                                                            theme.colors.text
                                                        }
                                                    />
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    </View>
                                ))
                            )}
                        </ScrollView>
                    )}
                </>
            ) : (
                <>
                    <View
                        style={{
                            backgroundColor: theme.colors.card,
                            borderRadius: 16,
                            padding: 16,
                            marginBottom: 16,
                        }}
                    >
                        <View
                            style={{
                                flexDirection: "row",
                                alignItems: "center",
                                marginBottom: 12,
                            }}
                        >
                            <Ionicons
                                name="trending-up-outline"
                                size={18}
                                color={theme.colors.text}
                                style={{ marginRight: 6 }}
                            />
                            <Text
                                style={{
                                    fontSize: 15,
                                    fontWeight: "600",
                                    color: theme.colors.text,
                                }}
                            >
                                Weekly Study Hours
                            </Text>
                        </View>

                        {weeklyData.length === 0 ? (
                            <Text
                                style={{
                                    color: theme.colors.text,
                                    opacity: 0.6,
                                }}
                            >
                                No study data this week yet.
                            </Text>
                        ) : (
                            weeklyData.map(({ day, studied, target }) => {
                                const progress = Math.min(
                                    (studied / target) * 100,
                                    100
                                );
                                return (
                                    <View
                                        key={day}
                                        style={{ marginBottom: 10 }}
                                    >
                                        <View
                                            style={{
                                                flexDirection: "row",
                                                justifyContent: "space-between",
                                                marginBottom: 4,
                                            }}
                                        >
                                            <Text
                                                style={{
                                                    color: theme.colors.text,
                                                    fontWeight: "500",
                                                    fontSize: 13,
                                                }}
                                            >
                                                {day}
                                            </Text>
                                            <Text
                                                style={{
                                                    color: theme.colors.text,
                                                    fontSize: 13,
                                                    opacity: 0.7,
                                                }}
                                            >
                                                {studied.toFixed(1)}h / {target}
                                                h
                                            </Text>
                                        </View>

                                        <View
                                            style={{
                                                height: 6,
                                                borderRadius: 4,
                                                backgroundColor:
                                                    theme.colors.border,
                                            }}
                                        >
                                            <View
                                                style={{
                                                    width: `${progress}%`,
                                                    height: 6,
                                                    borderRadius: 4,
                                                    backgroundColor:
                                                        theme.colors.text,
                                                }}
                                            />
                                        </View>
                                    </View>
                                );
                            })
                        )}
                    </View>
                </>
            )}

            {/* Create/Edit Goal Modal (IDENTICAL TO YOUR ORIGINAL) */}
            <Modal
                visible={isModalVisible}
                animationType="slide"
                transparent
                onRequestClose={() => setModalVisible(false)}
            >
                <KeyboardAvoidingView
                    style={{ flex: 1 }}
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                >
                    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                        <View
                            style={{
                                flex: 1,
                                justifyContent: "flex-end",
                                backgroundColor: "rgba(0,0,0,0.4)",
                            }}
                        >
                            <View
                                style={{
                                    backgroundColor: theme.colors.background,
                                    borderTopLeftRadius: 16,
                                    borderTopRightRadius: 16,
                                    padding: 20,
                                    minHeight: 420,
                                }}
                            >
                                <View
                                    style={{
                                        flexDirection: "row",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        marginBottom: 16,
                                    }}
                                >
                                    <Text
                                        style={{
                                            fontSize: 16,
                                            fontWeight: "600",
                                            color: theme.colors.text,
                                        }}
                                    >
                                        {isEditing
                                            ? "Edit Goal"
                                            : "Create Goal"}
                                    </Text>
                                    <TouchableOpacity
                                        onPress={() => setModalVisible(false)}
                                    >
                                        <Ionicons
                                            name="close"
                                            size={24}
                                            color={theme.colors.text}
                                        />
                                    </TouchableOpacity>
                                </View>

                                <ScrollView
                                    showsVerticalScrollIndicator={false}
                                    keyboardShouldPersistTaps="handled"
                                    contentContainerStyle={{
                                        paddingBottom: 100,
                                    }}
                                >
                                    <TextInput
                                        placeholder="Goal Title*"
                                        placeholderTextColor={
                                            theme.colors.text + "80"
                                        }
                                        value={title}
                                        onChangeText={setTitle}
                                        style={{
                                            backgroundColor: theme.colors.card,
                                            color: theme.colors.text,
                                            borderRadius: 8,
                                            padding: 12,
                                            marginBottom: 16,
                                        }}
                                    />

                                    <DropdownSelect
                                        label="Subject*"
                                        value={subject}
                                        onSelect={setSubject}
                                        options={[
                                            "Mathematics",
                                            "Physics",
                                            "Chemistry",
                                            "Biology",
                                            "Computer Science",
                                            "Engineering",
                                            "Business",
                                            "Economics",
                                            "Psychology",
                                            "Literature",
                                            "Art",
                                            "Law",
                                            "Medicine",
                                        ]}
                                    />

                                    <TimePickerInput
                                        label="Due Date"
                                        value={dueDate}
                                        onChange={setDueDate}
                                        mode="date"
                                    />

                                    <TextInput
                                        placeholder="Target Score by Grading (A, B, C)"
                                        placeholderTextColor={
                                            theme.colors.text + "80"
                                        }
                                        value={targetGrade}
                                        onChangeText={setTargetGrade}
                                        style={{
                                            backgroundColor: theme.colors.card,
                                            color: theme.colors.text,
                                            borderRadius: 8,
                                            padding: 12,
                                            marginTop: 16,
                                            marginBottom: 20,
                                        }}
                                    />

                                    <View
                                        style={{
                                            flexDirection: "row",
                                            justifyContent: "space-between",
                                        }}
                                    >
                                        <TouchableOpacity
                                            style={{
                                                flex: 1,
                                                backgroundColor:
                                                    theme.colors.card,
                                                padding: 14,
                                                borderRadius: 8,
                                                alignItems: "center",
                                                marginRight: 8,
                                            }}
                                            onPress={() =>
                                                setModalVisible(false)
                                            }
                                        >
                                            <Text
                                                style={{
                                                    color: theme.colors.text,
                                                    fontWeight: "500",
                                                }}
                                            >
                                                Cancel
                                            </Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={{
                                                flex: 1,
                                                backgroundColor:
                                                    theme.colors.text,
                                                padding: 14,
                                                borderRadius: 8,
                                                alignItems: "center",
                                                marginLeft: 8,
                                            }}
                                            onPress={handleSaveGoal}
                                            disabled={loading}
                                        >
                                            {loading ? (
                                                <ActivityIndicator
                                                    color={
                                                        theme.colors.background
                                                    }
                                                />
                                            ) : (
                                                <Text
                                                    style={{
                                                        color: theme.colors
                                                            .background,
                                                        fontWeight: "600",
                                                    }}
                                                >
                                                    {isEditing
                                                        ? "Save"
                                                        : "Create Goal"}
                                                </Text>
                                            )}
                                        </TouchableOpacity>
                                    </View>
                                </ScrollView>
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                </KeyboardAvoidingView>
            </Modal>

            {/* Add Task Modal */}
            <Modal
                visible={isTaskModalVisible}
                animationType="slide"
                transparent
                onRequestClose={() => setTaskModalVisible(false)}
            >
                <KeyboardAvoidingView
                    style={{ flex: 1 }}
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                >
                    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                        <View
                            style={{
                                flex: 1,
                                justifyContent: "flex-end",
                                backgroundColor: "rgba(0,0,0,0.5)",
                            }}
                        >
                            <View
                                style={{
                                    backgroundColor: theme.colors.background,
                                    borderTopLeftRadius: 16,
                                    borderTopRightRadius: 16,
                                    padding: 20,
                                }}
                            >
                                <View
                                    style={{
                                        flexDirection: "row",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        marginBottom: 16,
                                    }}
                                >
                                    <Text
                                        style={{
                                            fontSize: 16,
                                            fontWeight: "600",
                                            color: theme.colors.text,
                                        }}
                                    >
                                        Add New Task
                                    </Text>
                                    <TouchableOpacity
                                        onPress={() =>
                                            setTaskModalVisible(false)
                                        }
                                    >
                                        <Ionicons
                                            name="close"
                                            size={24}
                                            color={theme.colors.text}
                                        />
                                    </TouchableOpacity>
                                </View>

                                <TextInput
                                    placeholder="Task Description"
                                    placeholderTextColor={
                                        theme.colors.text + "80"
                                    }
                                    value={description}
                                    onChangeText={setDescription}
                                    style={{
                                        backgroundColor: theme.colors.card,
                                        color: theme.colors.text,
                                        borderRadius: 8,
                                        padding: 12,
                                        marginBottom: 12,
                                    }}
                                />

                                <DropdownSelect
                                    label="Priority"
                                    value={priority}
                                    onSelect={(v) => setPriority(v as any)}
                                    options={["Low", "Medium", "High"]}
                                />

                                <TextInput
                                    placeholder="Estimated Study Hours"
                                    placeholderTextColor={
                                        theme.colors.text + "80"
                                    }
                                    keyboardType="numeric"
                                    value={hours}
                                    onChangeText={setHours}
                                    style={{
                                        backgroundColor: theme.colors.card,
                                        color: theme.colors.text,
                                        borderRadius: 8,
                                        padding: 12,
                                        marginVertical: 12,
                                    }}
                                />

                                <TouchableOpacity
                                    style={{
                                        backgroundColor: theme.colors.text,
                                        padding: 14,
                                        borderRadius: 8,
                                        alignItems: "center",
                                    }}
                                    onPress={handleAddTask}
                                >
                                    <Text
                                        style={{
                                            color: theme.colors.background,
                                            fontWeight: "600",
                                        }}
                                    >
                                        Add Task
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                </KeyboardAvoidingView>
            </Modal>
        </View>
    );
}
