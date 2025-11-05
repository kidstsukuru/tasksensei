import React, { useState, useEffect, useRef } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useLocalData, useLocalSettings } from '../hooks/useLocalData';
import { Switch } from '@/components/ui/switch';
import { 
  Todo, 
  Schedule, 
  SleepRecord, 
  WeightRecord, 
  MealRecord, 
  DiaryEntry,
  DailyRoutine,
  MonthlyGoal,
  Link,
  PomodoroState,
  AppState 
} from '../types/local';
import {
  todoStore,
  scheduleStore,
  sleepRecordStore,
  weightRecordStore,
  mealRecordStore,
  diaryEntryStore,
  dailyRoutineStore,
  monthlyGoalStore,
  linkStore,
  userSettingsStore,
} from '../lib/localDataStore';
import type { 
  InsertTodo,
  InsertSchedule,
  InsertSleepRecord,
  InsertWeightRecord,
  InsertMealRecord,
  InsertDiaryEntry,
  InsertDailyRoutine,
  InsertMonthlyGoal,
  InsertLink,
  UserSettings
} from '../types/local';
import { 
  Bell, 
  Clock, 
  Home, 
  Timer, 
  Calendar, 
  Plus, 
  ChevronDown, 
  ArrowLeft, 
  Play, 
  Pause, 
  RotateCcw, 
  X,
  Camera,
  Smile,
  LogOut,
  User,
  Download,
  Star,
  Repeat,
  Settings,
  ListChecks,
  Link as LinkIcon
} from 'lucide-react';

const TaskManager: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState('home-screen');
  const [todoVisible, setTodoVisible] = useLocalStorage('todoVisible', false);
  
  // Export functionality state
  const [exportModalVisible, setExportModalVisible] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  
  // Notification functionality state
  const [notificationModalVisible, setNotificationModalVisible] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useLocalStorage('notificationsEnabled', false);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  
  // Calendar functionality state
  const [calendarModalVisible, setCalendarModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  // TODO input functionality state
  const [todoInputModalVisible, setTodoInputModalVisible] = useState(false);
  const [todoInputText, setTodoInputText] = useState('');
  const [repeatType, setRepeatType] = useState<'none' | 'daily' | 'weekly' | 'monthly'>('none');
  const [repeatDays, setRepeatDays] = useState<number[]>([]);
  const [repeatDate, setRepeatDate] = useState<number | null>(null);
  const [locationEnabled, setLocationEnabled] = useState(false);
  const [locationName, setLocationName] = useState('');
  const [locationLat, setLocationLat] = useState<number | null>(null);
  const [locationLng, setLocationLng] = useState<number | null>(null);
  const [locationRadius, setLocationRadius] = useState(100);
  
  // Schedule input functionality state
  const [scheduleInputModalVisible, setScheduleInputModalVisible] = useState(false);
  const [scheduleInputText, setScheduleInputText] = useState('');
  const [scheduleInputDate, setScheduleInputDate] = useState<Date | null>(null);
  const [pastSchedulesModalVisible, setPastSchedulesModalVisible] = useState(false);
  
  // Weekly review functionality state
  const [weekOffset, setWeekOffset] = useState(0); // 0 = this week, -1 = last week, 1 = next week

  // Local storage hooks for data
  const { data: todos = [], isLoading: todosLoading, refetch: refetchTodos } = useLocalData<Todo>(todoStore, 'todos');
  const { data: schedules = [], isLoading: schedulesLoading, refetch: refetchSchedules } = useLocalData<Schedule>(scheduleStore, 'schedules');
  const { data: sleepRecords = [], isLoading: sleepRecordsLoading, refetch: refetchSleepRecords } = useLocalData<SleepRecord>(sleepRecordStore, 'sleepRecords');
  const { data: weightRecords = [], isLoading: weightRecordsLoading, refetch: refetchWeightRecords } = useLocalData<WeightRecord>(weightRecordStore, 'weightRecords');
  const { data: mealRecords = [], isLoading: mealRecordsLoading, refetch: refetchMealRecords } = useLocalData<MealRecord>(mealRecordStore, 'mealRecords');
  const { data: diaryEntries = [], isLoading: diaryEntriesLoading, refetch: refetchDiaryEntries } = useLocalData<DiaryEntry>(diaryEntryStore, 'diaryEntries');
  const { data: dailyRoutines = [], isLoading: dailyRoutinesLoading, refetch: refetchDailyRoutines } = useLocalData<DailyRoutine>(dailyRoutineStore, 'dailyRoutines');
  const { data: monthlyGoals = [], isLoading: monthlyGoalsLoading, refetch: refetchMonthlyGoals } = useLocalData<MonthlyGoal>(monthlyGoalStore, 'monthlyGoals');
  const { data: userSettings, isLoading: settingsLoading, refetch: refetchSettings } = useLocalSettings(userSettingsStore);
  const { data: links = [], isLoading: linksLoading, refetch: refetchLinks } = useLocalData<Link>(linkStore, 'links');
  
  const [pomodoro, setPomodoro] = useState<PomodoroState>({
    minutes: 25,
    seconds: 0,
    isRunning: false,
    mode: 'pomodoro'
  });
  
  // Timer and Stopwatch states
  const [timerScreenMode, setTimerScreenMode] = useState<'pomodoro' | 'timer' | 'stopwatch'>('pomodoro');
  const [timerMinutes, setTimerMinutes] = useState(0);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  
  // Daily Routine states
  const [routineContent, setRoutineContent] = useState('');
  const [isRoutineEditing, setIsRoutineEditing] = useState(false);
  
  // Monthly Goal states
  const [weightGoal, setWeightGoal] = useState('');
  const [todoGoal, setTodoGoal] = useState('');
  const [achievementGoal, setAchievementGoal] = useState('');
  const [activityGoal, setActivityGoal] = useState('');
  const [isMonthlyGoalEditing, setIsMonthlyGoalEditing] = useState(false);
  const [showGoalSetupScreen, setShowGoalSetupScreen] = useState(false);
  const [stopwatchMinutes, setStopwatchMinutes] = useState(0);
  const [stopwatchSeconds, setStopwatchSeconds] = useState(0);
  const [stopwatchRunning, setStopwatchRunning] = useState(false);

  // Calendar states
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [calendarSelectedDay, setCalendarSelectedDay] = useState<Date | null>(null);
  
  // Link states
  const [linkInputVisible, setLinkInputVisible] = useState(false);
  const [linkTitle, setLinkTitle] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [linkCategory, setLinkCategory] = useState('other');
  
  // Stop all other modes when switching
  const switchTimerMode = (mode: 'pomodoro' | 'timer' | 'stopwatch') => {
    setPomodoro(prev => ({ ...prev, isRunning: false }));
    setTimerRunning(false);
    setStopwatchRunning(false);
    setTimerScreenMode(mode);
  };

  // Local storage CRUD operations
  const createTodoMutation = {
    mutate: (todoData: InsertTodo) => {
      todoStore.create({
        ...todoData,
        createdAt: new Date(),
        completed: todoData.completed ?? false,
      });
      refetchTodos();
    }
  };

  const updateTodoMutation = {
    mutate: ({ id, ...data }: { id: string; completed?: boolean }) => {
      todoStore.update(id, data);
      refetchTodos();
    }
  };

  const deleteTodoMutation = {
    mutate: (id: string) => {
      todoStore.delete(id);
      refetchTodos();
    }
  };

  const createScheduleMutation = {
    mutate: (scheduleData: InsertSchedule) => {
      scheduleStore.create({
        ...scheduleData,
        completed: scheduleData.completed ?? false,
      });
      refetchSchedules();
    }
  };

  const createSleepRecordMutation = {
    mutate: (sleepData: InsertSleepRecord) => {
      sleepRecordStore.create(sleepData);
      refetchSleepRecords();
    }
  };

  const createWeightRecordMutation = {
    mutate: (weightData: InsertWeightRecord) => {
      weightRecordStore.create(weightData);
      refetchWeightRecords();
    }
  };

  const createDiaryEntryMutation = {
    mutate: (diaryData: InsertDiaryEntry) => {
      diaryEntryStore.create(diaryData);
      refetchDiaryEntries();
    }
  };

  const deleteDiaryEntryMutation = {
    mutate: (id: string) => {
      diaryEntryStore.delete(id);
      refetchDiaryEntries();
    }
  };

  const createDailyRoutineMutation = {
    mutate: (routineData: InsertDailyRoutine) => {
      dailyRoutineStore.create(routineData);
      refetchDailyRoutines();
    },
    mutateAsync: async (routineData: InsertDailyRoutine) => {
      dailyRoutineStore.create(routineData);
      refetchDailyRoutines();
      return Promise.resolve();
    }
  };

  const updateDailyRoutineMutation = {
    mutate: ({ id, content }: { id: string; content: string }) => {
      dailyRoutineStore.update(id, { content });
      refetchDailyRoutines();
    },
    mutateAsync: async ({ id, content }: { id: string; content: string }) => {
      dailyRoutineStore.update(id, { content });
      refetchDailyRoutines();
      return Promise.resolve();
    }
  };

  const createMonthlyGoalMutation = {
    mutate: (goalData: InsertMonthlyGoal) => {
      monthlyGoalStore.create({
        ...goalData,
        createdAt: new Date(),
      });
      refetchMonthlyGoals();
    },
    mutateAsync: async (goalData: InsertMonthlyGoal) => {
      monthlyGoalStore.create({
        ...goalData,
        createdAt: new Date(),
      });
      refetchMonthlyGoals();
      return Promise.resolve();
    }
  };

  const updateMonthlyGoalMutation = {
    mutate: ({ id, weightGoal, todoGoal, achievementGoal, activityGoal }: { 
      id: string; 
      weightGoal?: string; 
      todoGoal?: string; 
      achievementGoal?: string; 
      activityGoal?: string; 
    }) => {
      monthlyGoalStore.update(id, { weightGoal, todoGoal, achievementGoal, activityGoal });
      refetchMonthlyGoals();
    },
    mutateAsync: async ({ id, weightGoal, todoGoal, achievementGoal, activityGoal }: { 
      id: string; 
      weightGoal?: string; 
      todoGoal?: string; 
      achievementGoal?: string; 
      activityGoal?: string; 
    }) => {
      monthlyGoalStore.update(id, { weightGoal, todoGoal, achievementGoal, activityGoal });
      refetchMonthlyGoals();
      return Promise.resolve();
    }
  };

  const updateSettingsMutation = {
    mutate: (settingsData: { darkMode?: boolean; themeColor?: string; pushNotifications?: boolean }) => {
      userSettingsStore.update(settingsData);
      refetchSettings();
    },
    mutateAsync: async (settingsData: { darkMode?: boolean; themeColor?: string; pushNotifications?: boolean }) => {
      userSettingsStore.update(settingsData);
      refetchSettings();
      return Promise.resolve();
    }
  };

  const createLinkMutation = {
    mutate: (linkData: InsertLink) => {
      linkStore.create({
        ...linkData,
        createdAt: new Date(),
      });
      refetchLinks();
      setLinkInputVisible(false);
      setLinkTitle('');
      setLinkUrl('');
      setLinkCategory('other');
    }
  };

  const deleteLinkMutation = {
    mutate: (id: string) => {
      linkStore.delete(id);
      refetchLinks();
    }
  };

  // Export functionality
  const convertToCSV = (data: any[], type: string): string => {
    if (data.length === 0) return '';
    
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header];
          if (value === null || value === undefined) return '';
          if (typeof value === 'string') return `"${value.replace(/"/g, '""')}"`;
          if (value instanceof Date) return `"${value.toISOString()}"`;
          return `"${value}"`;
        }).join(',')
      )
    ].join('\n');
    
    return csvContent;
  };

  const downloadFile = (content: string, filename: string, contentType: string) => {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const exportData = async (format: 'json' | 'csv') => {
    setExportLoading(true);
    try {
      const exportData = {
        exportDate: new Date().toISOString(),
        data: {
          todos,
          schedules,
          sleepRecords,
          weightRecords,
          mealRecords,
          diaryEntries,
          dailyRoutines,
          monthlyGoals,
          links,
          userSettings
        }
      };
      const timestamp = new Date().toISOString().split('T')[0];
      
      if (format === 'json') {
        const content = JSON.stringify(exportData, null, 2);
        downloadFile(content, `task-manager-export-${timestamp}.json`, 'application/json');
      } else if (format === 'csv') {
        // Create separate CSV files for each data type
        const { data } = exportData;
        const csvFiles = [
          { name: 'todos', data: data.todos },
          { name: 'schedules', data: data.schedules },
          { name: 'sleep-records', data: data.sleepRecords },
          { name: 'weight-records', data: data.weightRecords },
          { name: 'meal-records', data: data.mealRecords },
          { name: 'diary-entries', data: data.diaryEntries },
          { name: 'daily-routines', data: data.dailyRoutines },
          { name: 'monthly-goals', data: data.monthlyGoals },
          { name: 'links', data: data.links }
        ];
        
        // Create a single CSV file with all data sections
        let allCsvContent = '';
        csvFiles.forEach((file, index) => {
          if (file.data.length > 0) {
            if (allCsvContent) allCsvContent += '\n\n';
            allCsvContent += `### ${file.name.toUpperCase()} ###\n`;
            allCsvContent += convertToCSV(file.data, file.name);
          }
        });
        
        downloadFile(allCsvContent, `task-manager-export-${timestamp}.csv`, 'text/csv');
      }
      
      setExportModalVisible(false);
    } catch (error) {
      alert('エクスポートに失敗しました: ' + error);
    } finally {
      setExportLoading(false);
    }
  };

  // Notification functionality
  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      if (permission === 'granted') {
        setNotificationsEnabled(true);
      } else {
        setNotificationsEnabled(false);
      }
      return permission;
    }
    return 'denied';
  };

  const showNotification = (title: string, options?: NotificationOptions) => {
    if (notificationPermission === 'granted' && notificationsEnabled) {
      new Notification(title, {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        ...options
      });
    }
  };

  const checkTaskReminders = () => {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    // Check for incomplete todos and schedules
    const incompleteTodos = todos.filter(todo => !todo.completed);
    const todaySchedules = schedules.filter(schedule => {
      const scheduleDate = new Date(schedule.date);
      return scheduleDate.toDateString() === now.toDateString() && !schedule.completed;
    });

    if (incompleteTodos.length > 0) {
      showNotification('タスクリマインダー', {
        body: `${incompleteTodos.length}件の未完了タスクがあります`,
        tag: 'task-reminder'
      });
    }

    if (todaySchedules.length > 0) {
      showNotification('予定リマインダー', {
        body: `今日は${todaySchedules.length}件の予定があります`,
        tag: 'schedule-reminder'
      });
    }
  };

  const toggleNotifications = async () => {
    if (!notificationsEnabled) {
      const permission = await requestNotificationPermission();
      if (permission === 'granted') {
        // Check reminders immediately when enabled
        setTimeout(() => checkTaskReminders(), 1000);
      }
    } else {
      setNotificationsEnabled(false);
    }
  };

  // Check for reminders every 30 minutes when notifications are enabled
  useEffect(() => {
    if (notificationsEnabled && notificationPermission === 'granted') {
      const interval = setInterval(checkTaskReminders, 30 * 60 * 1000); // 30 minutes
      return () => clearInterval(interval);
    }
  }, [notificationsEnabled, notificationPermission, todos, schedules]);

  // Initialize notification permission status
  useEffect(() => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
      // Don't automatically enable notifications - respect user's saved preference
    }
  }, []);

  // Check if goal setup screen should be shown (first time in the month)
  useEffect(() => {
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
    const lastSetupMonth = localStorage.getItem('lastGoalSetupMonth');
    const currentMonthGoal = monthlyGoals.find(g => g.month === currentMonth);
    
    // Show goal setup screen if:
    // 1. It's a new month (different from lastSetupMonth)
    // 2. AND there's no goal set for current month
    if (lastSetupMonth !== currentMonth && !currentMonthGoal) {
      setShowGoalSetupScreen(true);
    }
  }, [monthlyGoals]);

  const [scheduleModalVisible, setScheduleModalVisible] = useState(false);
  const [scheduleInput, setScheduleInput] = useState('');
  const [diaryText, setDiaryText] = useState('');
  const [weightInput, setWeightInput] = useState('');
  const [heightInput, setHeightInput] = useState('');
  const [bodyFatInput, setBodyFatInput] = useState('');
  
  // Sleep time input states
  const [bedtimeHour, setBedtimeHour] = useState('');
  const [bedtimeMinute, setBedtimeMinute] = useState('');
  const [wakeupHour, setWakeupHour] = useState('');
  const [wakeupMinute, setWakeupMinute] = useState('');

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // BMI計算関数
  const calculateBMI = () => {
    if (weightRecords.length === 0) return null;
    
    const latestRecord = weightRecords[weightRecords.length - 1];
    const weight = latestRecord.weight;
    const height = latestRecord.height;
    
    if (height && height > 0) {
      const heightInMeters = height / 100; // cmをmに変換
      const bmi = weight / (heightInMeters * heightInMeters);
      return bmi.toFixed(1);
    }
    
    return null;
  };

  useEffect(() => {
    if (pomodoro.isRunning) {
      intervalRef.current = setInterval(() => {
        setPomodoro(prev => {
          if (prev.seconds > 0) {
            return { ...prev, seconds: prev.seconds - 1 };
          } else if (prev.minutes > 0) {
            return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
          } else {
            // Timer finished
            alert('時間です！');
            return { ...prev, isRunning: false };
          }
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [pomodoro.isRunning]);

  // Timer effect (countdown)
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (timerRunning) {
      interval = setInterval(() => {
        setTimerSeconds(prev => {
          if (prev > 0) {
            return prev - 1;
          } else if (timerMinutes > 0) {
            setTimerMinutes(m => m - 1);
            return 59;
          } else {
            setTimerRunning(false);
            alert('タイマー終了！');
            return 0;
          }
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerRunning, timerMinutes]);

  // Stopwatch effect (count up)
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (stopwatchRunning) {
      interval = setInterval(() => {
        setStopwatchSeconds(prev => {
          if (prev < 59) {
            return prev + 1;
          } else {
            setStopwatchMinutes(m => m + 1);
            return 0;
          }
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [stopwatchRunning]);

  const getCurrentDate = () => {
    return new Date().toLocaleDateString('ja-JP', {
      month: 'short',
      day: 'numeric',
      weekday: 'short'
    });
  };

  const getWeekStartEnd = (offset: number = 0) => {
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 = Sunday
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - dayOfWeek + (offset * 7));
    weekStart.setHours(0, 0, 0, 0);
    
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);
    
    return { weekStart, weekEnd };
  };

  const showScreen = (screenId: string) => {
    setCurrentScreen(screenId);
    window.scrollTo(0, 0);
  };

  const addTodo = () => {
    setTodoInputModalVisible(true);
  };

  const getCurrentLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocationLat(position.coords.latitude);
          setLocationLng(position.coords.longitude);
          setLocationName(`位置 (${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)})`);
        },
        (error) => {
          console.error('位置情報の取得に失敗しました:', error);
          alert('位置情報の取得に失敗しました。ブラウザの設定を確認してください。');
        }
      );
    } else {
      alert('このブラウザは位置情報をサポートしていません。');
    }
  };
  
  const saveTodoInput = () => {
    if (todoInputText.trim()) {
      createTodoMutation.mutate({
        text: todoInputText.trim(),
        completed: false,
        repeatType: repeatType === 'none' ? null : repeatType,
        repeatDays: repeatType === 'weekly' && repeatDays.length > 0 ? repeatDays : null,
        repeatDate: repeatType === 'monthly' ? repeatDate : null,
        location: locationEnabled && locationName ? locationName : null,
        locationLat: locationEnabled && locationLat !== null ? locationLat.toString() : null,
        locationLng: locationEnabled && locationLng !== null ? locationLng.toString() : null,
        locationRadius: locationEnabled ? locationRadius : null
      });
      setTodoInputText('');
      setRepeatType('none');
      setRepeatDays([]);
      setRepeatDate(null);
      setLocationEnabled(false);
      setLocationName('');
      setLocationLat(null);
      setLocationLng(null);
      setLocationRadius(100);
      if (!todoVisible) {
        setTodoVisible(true);
      }
      // Keep modal open for continuous input
    }
  };
  
  const addScheduleForDate = (date: Date) => {
    setScheduleInputDate(date);
    setScheduleInputModalVisible(true);
    setCalendarModalVisible(false);
  };
  
  const saveScheduleInput = () => {
    if (scheduleInputText.trim() && scheduleInputDate) {
      createScheduleMutation.mutate({
        text: scheduleInputText.trim(),
        date: scheduleInputDate.toLocaleDateString('sv-SE'),
        time: new Date(),
        completed: false
      });
      setScheduleInputText('');
      setScheduleInputModalVisible(false);
      setCalendarModalVisible(true);
    }
  };

  const toggleTodo = (id: string) => {
    const todo = todos.find(t => t.id === id);
    if (todo) {
      updateTodoMutation.mutate({
        id,
        completed: !todo.completed
      });
    }
  };

  const deleteTodo = (id: string) => {
    deleteTodoMutation.mutate(id);
  };

  const togglePomodoro = () => {
    setPomodoro(prev => ({ ...prev, isRunning: !prev.isRunning }));
  };

  const resetPomodoro = () => {
    setPomodoro(prev => ({
      ...prev,
      isRunning: false,
      minutes: prev.mode === 'pomodoro' ? 25 : prev.mode === 'shortBreak' ? 5 : 15,
      seconds: 0
    }));
  };

  const setPomodoroMode = (mode: 'pomodoro' | 'shortBreak' | 'longBreak') => {
    const minutes = mode === 'pomodoro' ? 25 : mode === 'shortBreak' ? 5 : 15;
    setPomodoro({
      minutes,
      seconds: 0,
      isRunning: false,
      mode
    });
  };

  const saveSleepRecord = () => {
    if (!bedtimeHour || !bedtimeMinute || !wakeupHour || !wakeupMinute) {
      return;
    }
    
    const bedHour = parseInt(bedtimeHour);
    const bedMin = parseInt(bedtimeMinute);
    const wakeHour = parseInt(wakeupHour);
    const wakeMin = parseInt(wakeupMinute);
    
    if (isNaN(bedHour) || isNaN(bedMin) || isNaN(wakeHour) || isNaN(wakeMin)) {
      return;
    }
    
    const now = new Date();
    const bedtime = new Date(now);
    bedtime.setHours(bedHour, bedMin, 0, 0);
    
    const wakeup = new Date(now);
    wakeup.setHours(wakeHour, wakeMin, 0, 0);
    
    // 起床時間が就寝時間より前の場合、翌日とみなす
    if (wakeup <= bedtime) {
      wakeup.setDate(wakeup.getDate() + 1);
    }
    
    const duration = wakeup.getTime() - bedtime.getTime();
    const todayDate = new Date().toISOString().split('T')[0];
    
    createSleepRecordMutation.mutate({
      date: todayDate,
      bedtime: bedtime,
      wakeup: wakeup,
      duration
    });
    
    setBedtimeHour('');
    setBedtimeMinute('');
    setWakeupHour('');
    setWakeupMinute('');
  };

  const saveSchedule = () => {
    if (scheduleInput.trim()) {
      createScheduleMutation.mutate({
        text: scheduleInput.trim(),
        date: new Date().toISOString().split('T')[0],
        time: new Date(),
        completed: false
      });
      setScheduleInput('');
      setScheduleModalVisible(false);
    }
  };

  const saveWeight = () => {
    if (weightInput.trim()) {
      const weight = parseFloat(weightInput);
      if (!isNaN(weight)) {
        createWeightRecordMutation.mutate({
          date: new Date().toISOString().split('T')[0],
          weight: weight,
          height: heightInput ? parseFloat(heightInput) : undefined,
          bodyFat: bodyFatInput ? parseFloat(bodyFatInput) : undefined
        });
        setWeightInput('');
        setHeightInput('');
        setBodyFatInput('');
      }
    }
  };

  const saveDiary = () => {
    if (diaryText.trim()) {
      createDiaryEntryMutation.mutate({
        date: new Date().toISOString().split('T')[0],
        content: diaryText.trim(),
        mood: undefined,
        photos: undefined
      });
      setDiaryText('');
    }
  };

  const getTodaysSchedules = () => {
    const today = new Date().toISOString().split('T')[0];
    return schedules.filter(schedule => schedule.date === today);
  };

  const getTodaysSleep = () => {
    const today = new Date().toISOString().split('T')[0];
    return sleepRecords.find(record => record.date === today);
  };

  const formatTime = (date: Date | null) => {
    if (!date) return '--:--';
    return date.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDuration = (milliseconds: number) => {
    const hours = Math.floor(milliseconds / (1000 * 60 * 60));
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const renderHomeScreen = () => (
    <div className="page p-4 space-y-6">
      {/* Header */}
      <header className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">タスク管理</h1>
        <div className="flex items-center gap-2">
          <button 
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            onClick={() => showScreen('pomodoro-screen')}
            data-testid="button-timer"
            title="タイマー"
          >
            <Timer size={24} />
          </button>
          <button 
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            onClick={() => showScreen('calendar-screen')}
            data-testid="button-calendar"
            title="カレンダー"
          >
            <Calendar size={24} />
          </button>
          <button 
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            onClick={() => showScreen('settings-screen')}
            data-testid="button-settings"
            title="設定"
          >
            <Settings size={24} />
          </button>
        </div>
      </header>

      {/* Scheduled Today Section */}
      <section className="space-y-2 mb-6">
        {schedulesLoading ? (
          <div className="text-center py-4 text-gray-500">Loading schedules...</div>
        ) : getTodaysSchedules().length > 0 && (
          <>
            <h2 className="text-xl font-bold">今日の予定</h2>
            {getTodaysSchedules().map(schedule => (
              <div key={schedule.id} className="task-card">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{schedule.text}</span>
                  <span className="text-sm text-gray-500">
                    {schedule.time ? formatTime(schedule.time) : ''}
                  </span>
                </div>
              </div>
            ))}
          </>
        )}
      </section>

      {/* TODO List Section */}
      <section>
        <div className="flex justify-between items-center mb-3">
          <div 
            className="flex items-center cursor-pointer flex-grow"
            onClick={() => setTodoVisible(!todoVisible)}
            data-testid="toggle-todo-visibility"
          >
            <h2 className="text-xl font-bold">TODOリスト</h2>
            <button 
              className="ml-2 bg-theme-500 text-white rounded-full w-7 h-7 flex items-center justify-center hover:bg-theme-600 transition-colors focus:outline-none focus:ring-2 focus:ring-theme-500 focus:ring-opacity-75"
              onClick={(e) => {
                e.stopPropagation();
                addTodo();
              }}
              data-testid="button-add-todo"
            >
              <Plus size={20} strokeWidth={2.5} />
            </button>
            <ChevronDown 
              className={`transition-transform ml-auto ${todoVisible ? 'rotate-180' : ''}`}
              size={24}
            />
          </div>
        </div>
        <div className={`${todoVisible ? '' : 'hidden'}`}>
          {todosLoading ? (
            <div className="text-center py-4 text-gray-500">Loading todos...</div>
          ) : (
          <div className="space-y-2">
            {todos.map(todo => (
              <div key={todo.id} className="task-item" data-testid={`todo-item-${todo.id}`}>
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={() => toggleTodo(todo.id)}
                  className="h-5 w-5 rounded border-gray-300 text-theme-600 focus:ring-theme-500"
                  data-testid={`checkbox-todo-${todo.id}`}
                />
                <span className={`flex-grow ${todo.completed ? 'line-through text-gray-400' : ''}`}>
                  {todo.text}
                </span>
                {todo.repeatType && (
                  <span title={
                    todo.repeatType === 'daily' ? '毎日' :
                    todo.repeatType === 'weekly' ? `毎週 ${todo.repeatDays?.map(d => ['日', '月', '火', '水', '木', '金', '土'][d]).join(', ')}` :
                    todo.repeatType === 'monthly' ? `毎月 ${todo.repeatDate}日` :
                    '繰り返し'
                  }>
                    <Repeat 
                      size={16} 
                      className="text-theme-500 mr-2" 
                      data-testid={`icon-repeat-${todo.id}`}
                    />
                  </span>
                )}
                <button 
                  onClick={() => deleteTodo(todo.id)}
                  className="text-red-500 hover:text-red-700"
                  data-testid={`button-delete-todo-${todo.id}`}
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
          )}
        </div>
      </section>

      {/* My Page Section */}
      <section>
        <h2 className="text-xl font-bold mb-3">マイページ</h2>
        <div className="grid grid-cols-2 gap-4">
          <div 
            className="record-card" 
            onClick={() => showScreen('sleep-detail-screen')}
            data-testid="card-sleep"
          >
            <h3 className="font-bold">睡眠</h3>
            <p className="text-sm text-gray-500">
              {sleepRecordsLoading ? 'Loading...' : getTodaysSleep() ? formatDuration(getTodaysSleep()!.duration) : '未記録'}
            </p>
          </div>
          <div 
            className="record-card" 
            onClick={() => showScreen('meal-detail-screen')}
            data-testid="card-meal"
          >
            <h3 className="font-bold">食事</h3>
            <p className="text-sm text-gray-500">1800 kcal</p>
          </div>
          <div 
            className="record-card" 
            onClick={() => showScreen('body-detail-screen')}
            data-testid="card-body"
          >
            <h3 className="font-bold">身体</h3>
            <p className="text-sm text-gray-500">
              {weightRecordsLoading ? 'Loading...' : weightRecords.length > 0 ? `${weightRecords[weightRecords.length - 1].weight} kg` : '65.2 kg'}
            </p>
          </div>
          <div 
            className="record-card relative" 
            onClick={() => showScreen('diary-detail-screen')}
            data-testid="card-diary"
          >
            <h3 className="font-bold flex items-center">
              メモ
              {diaryEntries.length > 0 && (
                <Star 
                  size={16} 
                  className="ml-2 text-yellow-500 fill-yellow-500" 
                  data-testid="memo-star-indicator"
                />
              )}
            </h3>
            <p className="text-sm text-gray-500">
              {diaryEntries.length > 0 
                ? `${diaryEntries.length}件のメモあり` 
                : 'メモを記録・管理...'
              }
            </p>
          </div>
          <div 
            className="record-card" 
            onClick={() => showScreen('links-screen')}
            data-testid="card-links"
          >
            <h3 className="font-bold flex items-center">
              <LinkIcon size={18} className="mr-1" />
              リンク
            </h3>
            <p className="text-sm text-gray-500">
              {linksLoading ? 'Loading...' : links.length > 0 
                ? `${links.length}件のリンク` 
                : '動画リンクを保存...'
              }
            </p>
          </div>
        </div>
      </section>
    </div>
  );

  const renderPomodoroScreen = () => (
    <div className="page p-4 text-center">
      <header className="flex items-center mb-6">
        <button 
          className="p-2 rounded-full hover:bg-gray-100"
          onClick={() => showScreen('home-screen')}
          data-testid="button-back"
        >
          <ArrowLeft size={24} />
        </button>
        <h2 className="text-xl font-bold mx-auto pr-8">タイマー</h2>
      </header>
      
      {/* Mode Selection Tabs */}
      <div className="flex justify-center space-x-2 mb-6">
        {[
          { mode: 'pomodoro' as const, label: 'ポモドーロ' },
          { mode: 'timer' as const, label: 'タイマー' },
          { mode: 'stopwatch' as const, label: 'ストップウォッチ' }
        ].map(({ mode, label }) => (
          <button
            key={mode}
            className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
              timerScreenMode === mode 
                ? 'bg-theme-500 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            onClick={() => switchTimerMode(mode)}
            data-testid={`button-mode-${mode}`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow-inner p-6">
        {/* Pomodoro Mode */}
        {timerScreenMode === 'pomodoro' && (
          <>
            <div className="flex justify-center space-x-2 mb-6">
              {[
                { mode: 'pomodoro', label: 'ポモドーロ' },
                { mode: 'shortBreak', label: '短い休憩' },
                { mode: 'longBreak', label: '長い休憩' }
              ].map(({ mode, label }) => (
                <button
                  key={mode}
                  className={`pomodoro-btn px-4 py-1 rounded-full text-sm font-medium ${
                    pomodoro.mode === mode ? 'active' : ''
                  }`}
                  onClick={() => setPomodoroMode(mode as any)}
                  data-testid={`button-pomodoro-${mode}`}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="text-7xl font-bold text-theme-900 mb-6" data-testid="text-pomodoro-timer">
              {String(pomodoro.minutes).padStart(2, '0')}:{String(pomodoro.seconds).padStart(2, '0')}
            </div>
            <div className="flex justify-center items-center space-x-6">
              <button
                className="w-16 h-16 flex items-center justify-center bg-theme-500 text-white font-semibold rounded-full shadow-md hover:bg-theme-600 transition"
                onClick={togglePomodoro}
                data-testid="button-pomodoro-toggle"
              >
                {pomodoro.isRunning ? <Pause size={32} /> : <Play size={32} />}
              </button>
              <button
                className="w-12 h-12 flex items-center justify-center bg-gray-200 text-gray-800 font-semibold rounded-full hover:bg-gray-300 transition"
                onClick={resetPomodoro}
                data-testid="button-pomodoro-reset"
              >
                <RotateCcw size={24} />
              </button>
            </div>
          </>
        )}

        {/* Timer Mode */}
        {timerScreenMode === 'timer' && (
          <>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">時間を設定</label>
              <div className="flex justify-center items-center space-x-2">
                <input 
                  type="number" 
                  min="0" 
                  max="99"
                  placeholder="0" 
                  value={timerMinutes || ''}
                  onChange={(e) => setTimerMinutes(parseInt(e.target.value) || 0)}
                  className="w-20 px-2 py-2 border rounded text-center text-2xl"
                  disabled={timerRunning}
                  data-testid="input-timer-minutes"
                />
                <span className="text-2xl font-medium">分</span>
                <input 
                  type="number" 
                  min="0" 
                  max="59"
                  placeholder="0" 
                  value={timerSeconds || ''}
                  onChange={(e) => setTimerSeconds(parseInt(e.target.value) || 0)}
                  className="w-20 px-2 py-2 border rounded text-center text-2xl"
                  disabled={timerRunning}
                  data-testid="input-timer-seconds"
                />
                <span className="text-2xl font-medium">秒</span>
              </div>
            </div>
            <div className="text-7xl font-bold text-theme-900 mb-6" data-testid="text-timer-display">
              {String(timerMinutes).padStart(2, '0')}:{String(timerSeconds).padStart(2, '0')}
            </div>
            <div className="flex justify-center items-center space-x-6">
              <button
                className="w-16 h-16 flex items-center justify-center bg-theme-500 text-white font-semibold rounded-full shadow-md hover:bg-theme-600 transition"
                onClick={() => setTimerRunning(!timerRunning)}
                disabled={timerMinutes === 0 && timerSeconds === 0}
                data-testid="button-timer-toggle"
              >
                {timerRunning ? <Pause size={32} /> : <Play size={32} />}
              </button>
              <button
                className="w-12 h-12 flex items-center justify-center bg-gray-200 text-gray-800 font-semibold rounded-full hover:bg-gray-300 transition"
                onClick={() => {
                  setTimerRunning(false);
                  setTimerMinutes(0);
                  setTimerSeconds(0);
                }}
                data-testid="button-timer-reset"
              >
                <RotateCcw size={24} />
              </button>
            </div>
          </>
        )}

        {/* Stopwatch Mode */}
        {timerScreenMode === 'stopwatch' && (
          <>
            <div className="text-7xl font-bold text-theme-900 mb-6" data-testid="text-stopwatch-display">
              {String(stopwatchMinutes).padStart(2, '0')}:{String(stopwatchSeconds).padStart(2, '0')}
            </div>
            <div className="flex justify-center items-center space-x-6">
              <button
                className="w-16 h-16 flex items-center justify-center bg-theme-500 text-white font-semibold rounded-full shadow-md hover:bg-theme-600 transition"
                onClick={() => setStopwatchRunning(!stopwatchRunning)}
                data-testid="button-stopwatch-toggle"
              >
                {stopwatchRunning ? <Pause size={32} /> : <Play size={32} />}
              </button>
              <button
                className="w-12 h-12 flex items-center justify-center bg-gray-200 text-gray-800 font-semibold rounded-full hover:bg-gray-300 transition"
                onClick={() => {
                  setStopwatchRunning(false);
                  setStopwatchMinutes(0);
                  setStopwatchSeconds(0);
                }}
                data-testid="button-stopwatch-reset"
              >
                <RotateCcw size={24} />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );

  const renderSleepDetailScreen = () => (
    <div className="page p-4">
      <header className="flex items-center mb-6">
        <button 
          className="p-2 rounded-full hover:bg-gray-100"
          onClick={() => showScreen('home-screen')}
          data-testid="button-back"
        >
          <ArrowLeft size={24} />
        </button>
        <h2 className="text-xl font-bold mx-auto pr-8">睡眠記録</h2>
      </header>
      <div className="px-4 space-y-6">
        {/* Sleep Time Input */}
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="font-bold text-lg mb-4">睡眠時間を記録</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">就寝時間</label>
              <div className="flex items-center space-x-2">
                <input 
                  type="number" 
                  min="0" 
                  max="23"
                  placeholder="22" 
                  value={bedtimeHour}
                  onChange={(e) => setBedtimeHour(e.target.value)}
                  className="w-16 px-2 py-2 border rounded text-center"
                  data-testid="input-bedtime-hour"
                />
                <span className="text-lg">時</span>
                <input 
                  type="number" 
                  min="0" 
                  max="59"
                  placeholder="30" 
                  value={bedtimeMinute}
                  onChange={(e) => setBedtimeMinute(e.target.value)}
                  className="w-16 px-2 py-2 border rounded text-center"
                  data-testid="input-bedtime-minute"
                />
                <span className="text-lg">分</span>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">起床時間</label>
              <div className="flex items-center space-x-2">
                <input 
                  type="number" 
                  min="0" 
                  max="23"
                  placeholder="6" 
                  value={wakeupHour}
                  onChange={(e) => setWakeupHour(e.target.value)}
                  className="w-16 px-2 py-2 border rounded text-center"
                  data-testid="input-wakeup-hour"
                />
                <span className="text-lg">時</span>
                <input 
                  type="number" 
                  min="0" 
                  max="59"
                  placeholder="30" 
                  value={wakeupMinute}
                  onChange={(e) => setWakeupMinute(e.target.value)}
                  className="w-16 px-2 py-2 border rounded text-center"
                  data-testid="input-wakeup-minute"
                />
                <span className="text-lg">分</span>
              </div>
            </div>
            
            <button 
              className="w-full px-4 py-2 bg-theme-500 text-white rounded-lg hover:bg-theme-600"
              onClick={saveSleepRecord}
              data-testid="button-save-sleep"
            >
              睡眠時間を保存
            </button>
          </div>
        </div>

        {/* Today's Sleep Record */}
        {getTodaysSleep() && (
          <div className="bg-white rounded-lg shadow p-4 space-y-4">
            <h3 className="font-bold text-lg">今日の睡眠記録</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">就寝時間:</span>
                <span className="font-medium" data-testid="text-today-bedtime">
                  {formatTime(getTodaysSleep()!.bedtime)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">起床時間:</span>
                <span className="font-medium" data-testid="text-today-wakeup">
                  {formatTime(getTodaysSleep()!.wakeup)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">睡眠時間:</span>
                <span className="font-medium text-theme-600" data-testid="text-today-duration">
                  {formatDuration(getTodaysSleep()!.duration)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Sleep History */}
        <div className="bg-white rounded-lg shadow p-4 space-y-4">
          <h3 className="font-bold text-lg">睡眠履歴</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {sleepRecords.slice(-10).reverse().map(record => (
              <div key={record.id} className="flex justify-between py-2 border-b">
                <span className="text-sm">{record.date}</span>
                <span className="text-sm font-medium">{formatDuration(record.duration)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderBodyDetailScreen = () => (
    <div className="page p-4">
      <header className="flex items-center mb-6">
        <button 
          className="p-2 rounded-full hover:bg-gray-100"
          onClick={() => showScreen('home-screen')}
          data-testid="button-back"
        >
          <ArrowLeft size={24} />
        </button>
        <h2 className="text-xl font-bold mx-auto pr-8">身体記録</h2>
      </header>
      <div className="px-4 space-y-6">
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="font-bold text-lg mb-4">今日の記録</h3>
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <div className="text-xl font-bold text-theme-600" data-testid="text-current-weight">
                {weightRecords.length > 0 ? weightRecords[weightRecords.length - 1].weight : '65.2'}
              </div>
              <div className="text-xs text-gray-500">体重 (kg)</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <div className="text-xl font-bold text-theme-600" data-testid="text-current-height">
                {weightRecords.length > 0 && weightRecords[weightRecords.length - 1].height 
                  ? weightRecords[weightRecords.length - 1].height! 
                  : '--'}
              </div>
              <div className="text-xs text-gray-500">身長 (cm)</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <div className="text-xl font-bold text-theme-600" data-testid="text-current-bmi">
                {calculateBMI() || '--'}
              </div>
              <div className="text-xs text-gray-500">BMI</div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="font-medium">体重 (kg)</label>
              <div className="flex items-center space-x-2">
                <input 
                  type="number" 
                  step="0.1" 
                  placeholder="65.2" 
                  value={weightInput}
                  onChange={(e) => setWeightInput(e.target.value)}
                  className="w-20 px-2 py-1 border rounded text-center"
                  data-testid="input-weight"
                />
                <button 
                  className="px-3 py-1 bg-theme-500 text-white text-sm rounded hover:bg-theme-600"
                  onClick={saveWeight}
                  data-testid="button-save-weight"
                >
                  保存
                </button>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <label className="font-medium">身長 (cm)</label>
              <div className="flex items-center space-x-2">
                <input 
                  type="number" 
                  step="0.1" 
                  placeholder="170.0" 
                  value={heightInput}
                  onChange={(e) => setHeightInput(e.target.value)}
                  className="w-20 px-2 py-1 border rounded text-center"
                  data-testid="input-height"
                />
                <button 
                  className="px-3 py-1 bg-theme-500 text-white text-sm rounded hover:bg-theme-600"
                  onClick={saveWeight}
                  data-testid="button-save-height"
                >
                  保存
                </button>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <label className="font-medium">体脂肪率 (%)</label>
              <div className="flex items-center space-x-2">
                <input 
                  type="number" 
                  step="0.1" 
                  placeholder="15.0" 
                  value={bodyFatInput}
                  onChange={(e) => setBodyFatInput(e.target.value)}
                  className="w-20 px-2 py-1 border rounded text-center"
                  data-testid="input-body-fat"
                />
                <button 
                  className="px-3 py-1 bg-theme-500 text-white text-sm rounded hover:bg-theme-600"
                  onClick={saveWeight}
                  data-testid="button-save-body-fat"
                >
                  保存
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="font-bold text-lg mb-4">体重推移</h3>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
            <span className="text-gray-500">チャートエリア</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderDiaryDetailScreen = () => (
    <div className="page p-4">
      <header className="flex items-center mb-6">
        <button 
          className="p-2 rounded-full hover:bg-gray-100"
          onClick={() => showScreen('home-screen')}
          data-testid="button-back"
        >
          <ArrowLeft size={24} />
        </button>
        <h2 className="text-xl font-bold mx-auto pr-8">メモ</h2>
      </header>
      <div className="px-4 space-y-6">
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="font-bold text-lg mb-4">新しいメモ</h3>
          <textarea 
            placeholder="メモを入力してください" 
            rows={8}
            value={diaryText}
            onChange={(e) => setDiaryText(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-theme-500 focus:border-theme-500"
            data-testid="textarea-diary"
          />
          <div className="flex justify-between items-center mt-4">
            <div className="flex items-center space-x-4">
              <button className="flex items-center space-x-1 text-gray-500 hover:text-theme-500" data-testid="button-add-photo">
                <Camera size={20} />
                <span className="text-sm">写真</span>
              </button>
              <button className="flex items-center space-x-1 text-gray-500 hover:text-theme-500" data-testid="button-add-mood">
                <Smile size={20} />
                <span className="text-sm">気分</span>
              </button>
            </div>
            <button 
              className="px-6 py-2 bg-theme-500 text-white rounded-lg hover:bg-theme-600"
              onClick={saveDiary}
              data-testid="button-save-diary"
            >
              保存
            </button>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="font-bold text-lg mb-4">過去のメモ</h3>
          <div className="space-y-3">
            {diaryEntries.slice(-5).reverse().map(entry => (
              <div key={entry.id} className="p-3 border rounded-lg relative">
                <button
                  onClick={() => deleteDiaryEntryMutation.mutate(entry.id)}
                  className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                  data-testid={`button-delete-diary-${entry.id}`}
                  aria-label="メモを削除"
                >
                  <X size={16} />
                </button>
                <div className="text-sm text-gray-500 mb-1">{entry.date}</div>
                <div className="text-sm pr-6">{entry.content}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // Initialize daily routine state when screen changes
  useEffect(() => {
    if (currentScreen === 'daily-routine-screen') {
      const today = new Date().toISOString().split('T')[0];
      const todayRoutine = dailyRoutines.find(r => r.date === today);
      setRoutineContent(todayRoutine?.content || '');
      setIsRoutineEditing(!todayRoutine);
    }
  }, [currentScreen, dailyRoutines]);

  // Initialize monthly goal state when screen changes
  useEffect(() => {
    if (currentScreen === 'monthly-goal-screen' || showGoalSetupScreen) {
      const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
      const currentMonthGoal = monthlyGoals.find(g => g.month === currentMonth);
      setWeightGoal(currentMonthGoal?.weightGoal || '');
      setTodoGoal(currentMonthGoal?.todoGoal || '');
      setAchievementGoal(currentMonthGoal?.achievementGoal || '');
      setActivityGoal(currentMonthGoal?.activityGoal || '');
      setIsMonthlyGoalEditing(!currentMonthGoal);
    }
  }, [currentScreen, showGoalSetupScreen, monthlyGoals]);

  const handleSaveDailyRoutine = async () => {
    const today = new Date().toISOString().split('T')[0];
    const todayRoutine = dailyRoutines.find(r => r.date === today);
    
    if (!routineContent.trim()) {
      alert('内容を入力してください');
      return;
    }

    try {
      if (todayRoutine) {
        await updateDailyRoutineMutation.mutateAsync({
          id: todayRoutine.id,
          content: routineContent
        });
      } else {
        await createDailyRoutineMutation.mutateAsync({
          date: today,
          content: routineContent
        });
      }
      setIsRoutineEditing(false);
    } catch (error) {
      console.error('Failed to save daily routine:', error);
      alert('保存に失敗しました');
    }
  };

  const handleSaveMonthlyGoal = async () => {
    const currentMonth = new Date().toISOString().slice(0, 7);
    const currentMonthGoal = monthlyGoals.find(g => g.month === currentMonth);
    
    // At least one goal should be filled
    if (!weightGoal.trim() && !todoGoal.trim() && !achievementGoal.trim() && !activityGoal.trim()) {
      alert('少なくとも1つの目標を入力してください');
      return;
    }

    try {
      if (currentMonthGoal) {
        await updateMonthlyGoalMutation.mutateAsync({
          id: currentMonthGoal.id,
          weightGoal: weightGoal.trim() || undefined,
          todoGoal: todoGoal.trim() || undefined,
          achievementGoal: achievementGoal.trim() || undefined,
          activityGoal: activityGoal.trim() || undefined,
        });
      } else {
        await createMonthlyGoalMutation.mutateAsync({
          month: currentMonth,
          weightGoal: weightGoal.trim() || undefined,
          todoGoal: todoGoal.trim() || undefined,
          achievementGoal: achievementGoal.trim() || undefined,
          activityGoal: activityGoal.trim() || undefined,
        });
      }
      setIsMonthlyGoalEditing(false);
      setShowGoalSetupScreen(false);
      // Save last setup month to localStorage
      localStorage.setItem('lastGoalSetupMonth', currentMonth);
    } catch (error) {
      console.error('Failed to save monthly goal:', error);
      alert('保存に失敗しました');
    }
  };

  const renderDailyRoutineScreen = () => {
    const today = new Date().toISOString().split('T')[0];
    const todayRoutine = dailyRoutines.find(r => r.date === today);

    return (
      <div className="page p-4">
        <header className="flex items-center mb-6">
          <button 
            className="p-2 rounded-full hover:bg-gray-100"
            onClick={() => showScreen('tasks-screen')}
            data-testid="button-back"
          >
            <ArrowLeft size={24} />
          </button>
          <h2 className="text-xl font-bold mx-auto pr-8">日課</h2>
        </header>
        <div className="px-4 space-y-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg">今日の日課</h3>
              {!isRoutineEditing && todayRoutine && (
                <button
                  onClick={() => setIsRoutineEditing(true)}
                  className="px-3 py-1 text-sm bg-theme-500 text-white rounded-full hover:bg-theme-600"
                  data-testid="button-edit-routine"
                >
                  編集
                </button>
              )}
            </div>
            <div className="mb-2 text-sm text-gray-500">{today}</div>
            {isRoutineEditing ? (
              <>
                <textarea
                  value={routineContent}
                  onChange={(e) => setRoutineContent(e.target.value)}
                  className="w-full p-3 border rounded-lg mb-4 min-h-[200px]"
                  placeholder="今日の日課を書いてください..."
                  data-testid="textarea-routine-content"
                />
                <button
                  onClick={handleSaveDailyRoutine}
                  className="w-full py-3 bg-theme-500 text-white rounded-full font-semibold hover:bg-theme-600"
                  data-testid="button-save-routine"
                >
                  保存
                </button>
              </>
            ) : (
              <div className="p-3 border rounded-lg bg-gray-50" data-testid="text-routine-content">
                {todayRoutine?.content || '今日の日課はまだ記録されていません'}
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="font-bold text-lg mb-4">過去の日課</h3>
            <div className="space-y-3">
              {dailyRoutines
                .filter(r => r.date !== today)
                .sort((a, b) => b.date.localeCompare(a.date))
                .slice(0, 5)
                .map(routine => (
                  <div key={routine.id} className="p-3 border rounded-lg">
                    <div className="text-sm text-gray-500 mb-1">{routine.date}</div>
                    <div className="text-sm">{routine.content}</div>
                  </div>
                ))}
              {dailyRoutines.filter(r => r.date !== today).length === 0 && (
                <div className="text-center text-gray-500 py-4">過去の記録はありません</div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderMonthlyGoalScreen = () => {
    const currentMonth = new Date().toISOString().slice(0, 7);
    const currentMonthGoal = monthlyGoals.find(g => g.month === currentMonth);
    const monthName = new Date().toLocaleDateString('ja-JP', { year: 'numeric', month: 'long' });

    return (
      <div className="page p-4">
        <header className="flex items-center mb-6">
          <button 
            className="p-2 rounded-full hover:bg-gray-100"
            onClick={() => {
              setShowGoalSetupScreen(false);
              showScreen('tasks-screen');
            }}
            data-testid="button-back"
          >
            <ArrowLeft size={24} />
          </button>
          <h2 className="text-xl font-bold mx-auto pr-8">月間目標</h2>
        </header>
        <div className="px-4 space-y-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg">{monthName}の目標</h3>
              {!isMonthlyGoalEditing && currentMonthGoal && (
                <button
                  onClick={() => setIsMonthlyGoalEditing(true)}
                  className="px-3 py-1 text-sm bg-theme-500 text-white rounded-full hover:bg-theme-600"
                  data-testid="button-edit-goal"
                >
                  編集
                </button>
              )}
            </div>
            {isMonthlyGoalEditing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">💪 体重目標</label>
                  <input
                    type="text"
                    value={weightGoal}
                    onChange={(e) => setWeightGoal(e.target.value)}
                    className="w-full p-3 border rounded-lg"
                    placeholder="例: 65kgを達成する"
                    data-testid="input-weight-goal"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">📝 やるべきこと</label>
                  <textarea
                    value={todoGoal}
                    onChange={(e) => setTodoGoal(e.target.value)}
                    className="w-full p-3 border rounded-lg min-h-[80px]"
                    placeholder="例: 毎日30分運動する、本を10冊読む"
                    data-testid="input-todo-goal"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">🎯 達成したい目標</label>
                  <textarea
                    value={achievementGoal}
                    onChange={(e) => setAchievementGoal(e.target.value)}
                    className="w-full p-3 border rounded-lg min-h-[80px]"
                    placeholder="例: 資格試験に合格する、プロジェクトを完成させる"
                    data-testid="input-achievement-goal"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">⚡ 部活動や仕事などでの目標</label>
                  <textarea
                    value={activityGoal}
                    onChange={(e) => setActivityGoal(e.target.value)}
                    className="w-full p-3 border rounded-lg min-h-[80px]"
                    placeholder="例: チームで優勝する、売上目標を達成する"
                    data-testid="input-activity-goal"
                  />
                </div>
                <button
                  onClick={handleSaveMonthlyGoal}
                  className="w-full py-3 bg-theme-500 text-white rounded-full font-semibold hover:bg-theme-600"
                  data-testid="button-save-goal"
                >
                  保存
                </button>
              </div>
            ) : (
              <div className="space-y-3" data-testid="text-goal-content">
                {currentMonthGoal ? (
                  <>
                    {currentMonthGoal.weightGoal && (
                      <div className="p-3 border rounded-lg bg-gray-50">
                        <div className="text-sm font-medium text-gray-700 mb-1">💪 体重目標</div>
                        <div className="text-sm">{currentMonthGoal.weightGoal}</div>
                      </div>
                    )}
                    {currentMonthGoal.todoGoal && (
                      <div className="p-3 border rounded-lg bg-gray-50">
                        <div className="text-sm font-medium text-gray-700 mb-1">📝 やるべきこと</div>
                        <div className="text-sm whitespace-pre-wrap">{currentMonthGoal.todoGoal}</div>
                      </div>
                    )}
                    {currentMonthGoal.achievementGoal && (
                      <div className="p-3 border rounded-lg bg-gray-50">
                        <div className="text-sm font-medium text-gray-700 mb-1">🎯 達成したい目標</div>
                        <div className="text-sm whitespace-pre-wrap">{currentMonthGoal.achievementGoal}</div>
                      </div>
                    )}
                    {currentMonthGoal.activityGoal && (
                      <div className="p-3 border rounded-lg bg-gray-50">
                        <div className="text-sm font-medium text-gray-700 mb-1">⚡ 部活動や仕事などでの目標</div>
                        <div className="text-sm whitespace-pre-wrap">{currentMonthGoal.activityGoal}</div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="p-3 border rounded-lg bg-gray-50 text-center text-gray-500">
                    今月の目標はまだ設定されていません
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="font-bold text-lg mb-4">過去の月間目標</h3>
            <div className="space-y-3">
              {monthlyGoals
                .filter(g => g.month !== currentMonth)
                .sort((a, b) => b.month.localeCompare(a.month))
                .slice(0, 5)
                .map(goal => {
                  const date = new Date(goal.month + '-01');
                  const monthLabel = date.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long' });
                  return (
                    <div key={goal.id} className="p-3 border rounded-lg">
                      <div className="text-sm text-gray-500 mb-2">{monthLabel}</div>
                      <div className="space-y-2 text-sm">
                        {goal.weightGoal && <div>💪 {goal.weightGoal}</div>}
                        {goal.todoGoal && <div>📝 {goal.todoGoal}</div>}
                        {goal.achievementGoal && <div>🎯 {goal.achievementGoal}</div>}
                        {goal.activityGoal && <div>⚡ {goal.activityGoal}</div>}
                      </div>
                    </div>
                  );
                })}
              {monthlyGoals.filter(g => g.month !== currentMonth).length === 0 && (
                <div className="text-center text-gray-500 py-4">過去の記録はありません</div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderWeeklyReviewScreen = () => {
    const { weekStart, weekEnd } = getWeekStartEnd(weekOffset);
    const weekStartStr = weekStart.toISOString().split('T')[0];
    const weekEndStr = weekEnd.toISOString().split('T')[0];
    
    // Filter data for the current week
    const weekTodos = todos.filter(t => {
      const createdDate = new Date(t.createdAt);
      return createdDate >= weekStart && createdDate <= weekEnd && t.completed;
    });
    
    const weekSleepRecords = sleepRecords.filter(r => r.date >= weekStartStr && r.date <= weekEndStr);
    const weekWeightRecords = weightRecords.filter(r => r.date >= weekStartStr && r.date <= weekEndStr);
    const weekMealRecords = mealRecords.filter(r => r.date >= weekStartStr && r.date <= weekEndStr);
    const weekDiaryEntries = diaryEntries.filter(d => d.date >= weekStartStr && d.date <= weekEndStr);
    
    // Calculate averages
    const avgSleepHours = weekSleepRecords.length > 0
      ? weekSleepRecords.reduce((sum, r) => sum + r.duration, 0) / weekSleepRecords.length / (1000 * 60 * 60)
      : 0;
    
    const avgWeight = weekWeightRecords.length > 0
      ? weekWeightRecords.reduce((sum, r) => sum + r.weight, 0) / weekWeightRecords.length
      : 0;
    
    const weightChange = weekWeightRecords.length >= 2
      ? weekWeightRecords[weekWeightRecords.length - 1].weight - weekWeightRecords[0].weight
      : 0;
    
    const weekLabel = weekOffset === 0 ? '今週' : weekOffset === -1 ? '先週' : '来週';
    const weekDateRange = `${weekStart.getMonth() + 1}/${weekStart.getDate()} - ${weekEnd.getMonth() + 1}/${weekEnd.getDate()}`;

    return (
      <div className="page p-4">
        <header className="flex items-center mb-6">
          <button 
            className="p-2 rounded-full hover:bg-gray-100"
            onClick={() => showScreen('tasks-screen')}
            data-testid="button-back"
          >
            <ArrowLeft size={24} />
          </button>
          <h2 className="text-xl font-bold mx-auto pr-8">週次振り返り</h2>
        </header>
        
        <div className="px-4 space-y-6">
          {/* Week Navigation */}
          <div className="flex items-center justify-between bg-white rounded-lg shadow p-4">
            <button
              onClick={() => setWeekOffset(weekOffset - 1)}
              className="p-2 hover:bg-gray-100 rounded-full"
              data-testid="button-prev-week"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="text-center">
              <div className="font-bold text-lg" data-testid="text-week-label">{weekLabel}</div>
              <div className="text-sm text-gray-500">{weekDateRange}</div>
            </div>
            <button
              onClick={() => setWeekOffset(weekOffset + 1)}
              className="p-2 hover:bg-gray-100 rounded-full"
              data-testid="button-next-week"
            >
              <ArrowLeft size={20} className="rotate-180" />
            </button>
          </div>

          {/* Weekly Summary Cards */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-lg shadow p-4 text-center" data-testid="card-completed-tasks">
              <div className="text-3xl font-bold text-theme-500">{weekTodos.length}</div>
              <div className="text-sm text-gray-500 mt-1">達成タスク</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4 text-center" data-testid="card-avg-sleep">
              <div className="text-3xl font-bold text-theme-500">{avgSleepHours > 0 ? avgSleepHours.toFixed(1) : '-'}</div>
              <div className="text-sm text-gray-500 mt-1">平均睡眠時間 (h)</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4 text-center" data-testid="card-avg-weight">
              <div className="text-3xl font-bold text-theme-500">{avgWeight > 0 ? avgWeight.toFixed(1) : '-'}</div>
              <div className="text-sm text-gray-500 mt-1">平均体重 (kg)</div>
              {weekWeightRecords.length >= 2 && (
                <div className={`text-xs mt-1 ${weightChange > 0 ? 'text-red-500' : weightChange < 0 ? 'text-green-500' : 'text-gray-500'}`} data-testid="text-weight-change">
                  {weightChange > 0 ? '+' : ''}{weightChange.toFixed(1)} kg
                </div>
              )}
            </div>
            <div className="bg-white rounded-lg shadow p-4 text-center" data-testid="card-diary-count">
              <div className="text-3xl font-bold text-theme-500">{weekDiaryEntries.length}</div>
              <div className="text-sm text-gray-500 mt-1">メモ記録</div>
            </div>
          </div>

          {/* Record Details */}
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="font-bold text-lg mb-4">週間記録の詳細</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-700">睡眠記録</span>
                <span className="font-semibold">{weekSleepRecords.length}件</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-700">体重記録</span>
                <span className="font-semibold">{weekWeightRecords.length}件</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-700">食事記録</span>
                <span className="font-semibold">{weekMealRecords.length}件</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderWeekTrackerScreen = () => {
    const { weekStart, weekEnd } = getWeekStartEnd(weekOffset);
    const weekLabel = weekOffset === 0 ? '今週' : weekOffset === -1 ? '先週' : '来週';
    const weekDateRange = `${weekStart.getMonth() + 1}/${weekStart.getDate()} - ${weekEnd.getMonth() + 1}/${weekEnd.getDate()}`;

    // Generate array of days in the week
    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(weekStart);
      day.setDate(weekStart.getDate() + i);
      weekDays.push(day);
    }

    return (
      <div className="page p-4">
        <header className="flex items-center mb-6">
          <button 
            className="p-2 rounded-full hover:bg-gray-100"
            onClick={() => showScreen('tasks-screen')}
            data-testid="button-back"
          >
            <ArrowLeft size={24} />
          </button>
          <h2 className="text-xl font-bold mx-auto pr-8">週間トラッカー</h2>
        </header>
        
        <div className="px-4 space-y-6">
          {/* Week Navigation */}
          <div className="flex items-center justify-between bg-white rounded-lg shadow p-4">
            <button
              onClick={() => setWeekOffset(weekOffset - 1)}
              className="p-2 hover:bg-gray-100 rounded-full"
              data-testid="button-prev-week-tracker"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="text-center">
              <div className="font-bold text-lg" data-testid="text-week-tracker-label">{weekLabel}</div>
              <div className="text-sm text-gray-500">{weekDateRange}</div>
            </div>
            <button
              onClick={() => setWeekOffset(weekOffset + 1)}
              className="p-2 hover:bg-gray-100 rounded-full"
              data-testid="button-next-week-tracker"
            >
              <ArrowLeft size={20} className="rotate-180" />
            </button>
          </div>

          {/* Daily Progress Table */}
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="font-bold text-lg mb-4">日ごとの記録</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm" data-testid="table-daily-progress">
                <thead>
                  <tr className="border-b">
                    <th className="py-2 text-left">日付</th>
                    <th className="py-2 text-center">タスク</th>
                    <th className="py-2 text-center">睡眠</th>
                    <th className="py-2 text-center">体重</th>
                  </tr>
                </thead>
                <tbody>
                  {weekDays.map((day, index) => {
                    const dayStr = day.toLocaleDateString('sv-SE');
                    const dayTodos = todos.filter(t => {
                      const createdDate = new Date(t.createdAt);
                      return createdDate.toLocaleDateString('sv-SE') === dayStr && t.completed;
                    });
                    const daySleep = sleepRecords.find(r => r.date === dayStr);
                    const dayWeight = weightRecords.find(r => r.date === dayStr);
                    
                    const sleepHours = daySleep 
                      ? (daySleep.duration / (1000 * 60 * 60)).toFixed(1) 
                      : '-';
                    const weight = dayWeight ? dayWeight.weight.toFixed(1) : '-';
                    
                    const dayLabel = ['日', '月', '火', '水', '木', '金', '土'][day.getDay()];
                    const isToday = day.toDateString() === new Date().toDateString();
                    
                    return (
                      <tr 
                        key={index} 
                        className={`border-b ${isToday ? 'bg-theme-50' : ''}`}
                        data-testid={`row-day-${index}`}
                      >
                        <td className="py-3">
                          <div className="font-medium">{day.getMonth() + 1}/{day.getDate()}</div>
                          <div className="text-xs text-gray-500">{dayLabel}</div>
                        </td>
                        <td className="py-3 text-center">
                          <div className="font-semibold text-theme-500">{dayTodos.length}</div>
                        </td>
                        <td className="py-3 text-center">
                          <div className={sleepHours !== '-' ? 'font-semibold' : 'text-gray-400'}>{sleepHours}h</div>
                        </td>
                        <td className="py-3 text-center">
                          <div className={weight !== '-' ? 'font-semibold' : 'text-gray-400'}>{weight}kg</div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderMealDetailScreen = () => (
    <div className="page p-4">
      <header className="flex items-center mb-6">
        <button 
          className="p-2 rounded-full hover:bg-gray-100"
          onClick={() => showScreen('home-screen')}
          data-testid="button-back"
        >
          <ArrowLeft size={24} />
        </button>
        <h2 className="text-xl font-bold mx-auto pr-8">食事記録</h2>
      </header>
      <div className="px-4 space-y-6">
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="font-bold text-lg mb-4">今日の食事記録</h3>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-theme-600">1800</div>
              <div className="text-sm text-gray-500">カロリー</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-theme-600">3</div>
              <div className="text-sm text-gray-500">食事回数</div>
            </div>
          </div>
          <div className="space-y-3">
            {[
              { meal: '朝食', items: [{ name: 'トースト', calories: 200 }] },
              { meal: '昼食', items: [{ name: 'サンドイッチ', calories: 450 }] },
              { meal: '夕食', items: [{ name: 'カレーライス', calories: 650 }] }
            ].map(({ meal, items }) => (
              <div key={meal}>
                <h4 className="font-medium text-gray-700 mb-2">{meal}</h4>
                <div className="space-y-2 mb-3">
                  {items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center py-2 border-b">
                      <span>{item.name}</span>
                      <span className="text-sm text-gray-500">{item.calories}kcal</span>
                    </div>
                  ))}
                </div>
                <button 
                  className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-theme-400 hover:text-theme-500"
                  data-testid={`button-add-${meal}`}
                >
                  + {meal}を追加
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderTasksScreen = () => (
    <div className="page p-4 space-y-6">
      {/* Header */}
      <header className="flex items-center mb-4">
        <button 
          className="p-2 rounded-full hover:bg-gray-100"
          onClick={() => showScreen('home-screen')}
          data-testid="button-back"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-2xl font-bold mx-auto pr-8">タスク管理</h1>
      </header>

      {/* TODO List Section */}
      <section>
        <div className="flex justify-between items-center mb-3">
          <div 
            className="flex items-center cursor-pointer flex-grow"
            onClick={() => setTodoVisible(!todoVisible)}
            data-testid="toggle-todo-visibility"
          >
            <h2 className="text-xl font-bold">TODOリスト</h2>
            <button 
              className="ml-2 bg-theme-500 text-white rounded-full w-7 h-7 flex items-center justify-center hover:bg-theme-600 transition-colors focus:outline-none focus:ring-2 focus:ring-theme-500 focus:ring-opacity-75"
              onClick={(e) => {
                e.stopPropagation();
                addTodo();
              }}
              data-testid="button-add-todo-tasks"
            >
              <Plus size={20} strokeWidth={2.5} />
            </button>
            <ChevronDown 
              className={`transition-transform ml-auto ${todoVisible ? 'rotate-180' : ''}`}
              size={24}
            />
          </div>
        </div>
        <div className={`${todoVisible ? '' : 'hidden'}`}>
          {todosLoading ? (
            <div className="text-center py-4 text-gray-500">Loading todos...</div>
          ) : (
          <div className="space-y-2">
            {todos.map(todo => (
              <div key={todo.id} className="task-item" data-testid={`todo-item-tasks-${todo.id}`}>
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={() => toggleTodo(todo.id)}
                  className="h-5 w-5 rounded border-gray-300 text-theme-600 focus:ring-theme-500"
                  data-testid={`checkbox-todo-tasks-${todo.id}`}
                />
                <span className={`flex-grow ${todo.completed ? 'line-through text-gray-400' : ''}`}>
                  {todo.text}
                </span>
                {todo.repeatType && (
                  <span title={
                    todo.repeatType === 'daily' ? '毎日' :
                    todo.repeatType === 'weekly' ? `毎週 ${todo.repeatDays?.map(d => ['日', '月', '火', '水', '木', '金', '土'][d]).join(', ')}` :
                    todo.repeatType === 'monthly' ? `毎月 ${todo.repeatDate}日` :
                    '繰り返し'
                  }>
                    <Repeat 
                      size={16} 
                      className="text-theme-500 mr-2" 
                      data-testid={`icon-repeat-tasks-${todo.id}`}
                    />
                  </span>
                )}
                <button 
                  onClick={() => deleteTodo(todo.id)}
                  className="text-red-500 hover:text-red-700"
                  data-testid={`button-delete-todo-tasks-${todo.id}`}
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
          )}
        </div>
      </section>

      {/* Schedules Section */}
      <section className="space-y-2">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-xl font-bold">今日の予定</h2>
          <button
            onClick={() => setPastSchedulesModalVisible(true)}
            className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300 transition-colors"
            data-testid="button-past-schedules"
          >
            過去の予定
          </button>
        </div>
        {schedulesLoading ? (
          <div className="text-center py-4 text-gray-500">Loading schedules...</div>
        ) : (() => {
          const today = new Date().toLocaleDateString('sv-SE');
          const todaySchedules = schedules.filter(s => s.date === today);
          return todaySchedules.length > 0 ? (
            <div className="space-y-2">
              {todaySchedules.map(schedule => (
                <div key={schedule.id} className="task-card" data-testid={`schedule-item-tasks-${schedule.id}`}>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{schedule.text}</span>
                    <span className="text-sm text-gray-500">
                      {schedule.time ? new Date(schedule.time).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' }) : ''}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">今日の予定はありません</p>
          );
        })()}
      </section>

      {/* Management Cards */}
      <section>
        <h2 className="text-xl font-bold mb-3">管理</h2>
        <div className="grid grid-cols-2 gap-4">
          <div 
            className="record-card"
            onClick={() => showScreen('daily-routine-screen')}
            data-testid="card-daily-routine-tasks"
          >
            <h3 className="font-bold">今日やったこと</h3>
            <p className="text-sm text-gray-500">毎日の習慣...</p>
          </div>
          <div 
            className="record-card"
            onClick={() => showScreen('monthly-goal-screen')}
            data-testid="card-monthly-goal-tasks"
          >
            <h3 className="font-bold">月間目標</h3>
            <p className="text-sm text-gray-500">今月の目標を設定...</p>
          </div>
          <div 
            className="record-card"
            onClick={() => showScreen('weekly-review-screen')}
            data-testid="card-weekly-review-tasks"
          >
            <h3 className="font-bold">週次振り返り</h3>
            <p className="text-sm text-gray-500">今週の記録を確認...</p>
          </div>
          <div 
            className="record-card"
            onClick={() => showScreen('week-tracker-screen')}
            data-testid="card-week-tracker-tasks"
          >
            <h3 className="font-bold">週間トラッカー</h3>
            <p className="text-sm text-gray-500">日ごとの進捗を確認...</p>
          </div>
        </div>
      </section>

      {/* Past Schedules Modal */}
      {pastSchedulesModalVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">過去の予定</h2>
              <button
                onClick={() => setPastSchedulesModalVisible(false)}
                className="p-2 hover:bg-gray-100 rounded-full"
                data-testid="button-close-past-schedules"
              >
                <X size={20} />
              </button>
            </div>
            {(() => {
              const today = new Date().toLocaleDateString('sv-SE');
              const pastSchedules = schedules.filter(s => s.date !== today);
              
              if (pastSchedules.length === 0) {
                return <p className="text-gray-500 text-center py-8">過去の予定はありません</p>;
              }

              // Group schedules by month
              const schedulesByMonth: { [key: string]: Schedule[] } = {};
              pastSchedules.forEach(schedule => {
                const monthKey = schedule.date.slice(0, 7); // YYYY-MM
                if (!schedulesByMonth[monthKey]) {
                  schedulesByMonth[monthKey] = [];
                }
                schedulesByMonth[monthKey].push(schedule);
              });

              // Sort months in descending order
              const sortedMonths = Object.keys(schedulesByMonth).sort((a, b) => b.localeCompare(a));

              return (
                <div className="space-y-6">
                  {sortedMonths.map(monthKey => {
                    const date = new Date(monthKey + '-01');
                    const monthLabel = date.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long' });
                    const monthSchedules = schedulesByMonth[monthKey].sort((a, b) => b.date.localeCompare(a.date));

                    return (
                      <div key={monthKey} data-testid={`month-group-${monthKey}`}>
                        <h3 className="font-bold text-lg mb-3 text-theme-600">{monthLabel}</h3>
                        <div className="space-y-2">
                          {monthSchedules.map(schedule => (
                            <div key={schedule.id} className="bg-gray-50 rounded-lg p-3" data-testid={`past-schedule-${schedule.id}`}>
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1">
                                  <div className="font-medium">{schedule.text}</div>
                                  <div className="text-sm text-gray-500 mt-1">
                                    {new Date(schedule.date).toLocaleDateString('ja-JP', { month: 'long', day: 'numeric', weekday: 'short' })}
                                    {schedule.time && ` ${new Date(schedule.time).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}`}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );

  const renderCalendarScreen = () => {
    // Generate calendar days
    const getCalendarDays = () => {
      const year = calendarMonth.getFullYear();
      const month = calendarMonth.getMonth();
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      const daysInMonth = lastDay.getDate();
      const startingDayOfWeek = firstDay.getDay();

      const days: (Date | null)[] = [];
      
      // Add empty cells for days before the first day of the month
      for (let i = 0; i < startingDayOfWeek; i++) {
        days.push(null);
      }
      
      // Add all days of the month
      for (let day = 1; day <= daysInMonth; day++) {
        days.push(new Date(year, month, day));
      }
      
      return days;
    };

    const getDayTasks = (date: Date) => {
      const dateStr = date.toLocaleDateString('sv-SE');
      return todos.filter(todo => {
        const todoDate = new Date(todo.createdAt).toLocaleDateString('sv-SE');
        return todoDate === dateStr;
      });
    };

    const getDaySchedules = (date: Date) => {
      const dateStr = date.toLocaleDateString('sv-SE');
      return schedules.filter(schedule => schedule.date === dateStr);
    };

    const hasOverdueTasks = (date: Date) => {
      const dateStr = date.toLocaleDateString('sv-SE');
      const today = new Date().toLocaleDateString('sv-SE');
      if (dateStr >= today) return false;
      
      const dayTasks = getDayTasks(date);
      return dayTasks.some(task => !task.completed);
    };

    const goToPreviousMonth = () => {
      setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1));
    };

    const goToNextMonth = () => {
      setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1));
    };

    const isToday = (date: Date | null) => {
      if (!date) return false;
      const today = new Date();
      return date.toDateString() === today.toDateString();
    };

    const calendarDays = getCalendarDays();

    return (
      <div className="page p-4">
        <header className="flex items-center mb-6">
          <button 
            className="p-2 rounded-full hover:bg-gray-100"
            onClick={() => showScreen('home-screen')}
            data-testid="button-back"
          >
            <ArrowLeft size={24} />
          </button>
          <h2 className="text-xl font-bold mx-auto pr-8">カレンダー</h2>
        </header>
        
        <div className="px-4 space-y-6">
          {/* Month Navigation */}
          <div className="flex items-center justify-between bg-white rounded-lg shadow p-4">
            <button
              onClick={goToPreviousMonth}
              className="p-2 hover:bg-gray-100 rounded-full"
              data-testid="button-prev-month"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="text-center">
              <div className="font-bold text-lg" data-testid="text-current-month">
                {calendarMonth.getFullYear()}年 {calendarMonth.getMonth() + 1}月
              </div>
            </div>
            <button
              onClick={goToNextMonth}
              className="p-2 hover:bg-gray-100 rounded-full"
              data-testid="button-next-month"
            >
              <ArrowLeft size={20} className="rotate-180" />
            </button>
          </div>

          {/* Calendar Grid */}
          <div className="bg-white rounded-lg shadow p-4">
            {/* Weekday Headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['日', '月', '火', '水', '木', '金', '土'].map((day, index) => (
                <div key={index} className="text-center text-sm font-semibold text-gray-500 py-2">
                  {day}
                </div>
              ))}
            </div>
            
            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((date, index) => {
                if (!date) {
                  return <div key={`empty-${index}`} className="h-12" />;
                }
                
                const dayTasks = getDayTasks(date);
                const daySchedules = getDaySchedules(date);
                const hasOverdue = hasOverdueTasks(date);
                const isSelected = calendarSelectedDay?.toDateString() === date.toDateString();
                
                return (
                  <button
                    key={index}
                    onClick={() => setCalendarSelectedDay(date)}
                    className={`h-12 rounded-lg flex flex-col items-center justify-center relative transition-colors ${
                      isToday(date)
                        ? 'border-2 border-theme-500 text-theme-600 font-bold'
                        : isSelected
                        ? 'bg-theme-100 text-theme-700'
                        : 'hover:bg-gray-100'
                    }`}
                    data-testid={`calendar-day-${date.getDate()}`}
                  >
                    <span className="text-sm">{date.getDate()}</span>
                    <div className="flex gap-0.5 mt-1">
                      {dayTasks.length > 0 && (
                        <div className="w-1 h-1 rounded-full bg-theme-500" data-testid={`task-dot-${date.getDate()}`} />
                      )}
                      {daySchedules.length > 0 && (
                        <div className="w-1 h-1 rounded-full bg-blue-500" data-testid={`schedule-dot-${date.getDate()}`} />
                      )}
                      {hasOverdue && (
                        <div className="w-1 h-1 rounded-full bg-red-500" data-testid={`overdue-dot-${date.getDate()}`} />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected Day Details */}
          {calendarSelectedDay && (
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="font-bold text-lg mb-4">
                {calendarSelectedDay.getMonth() + 1}月{calendarSelectedDay.getDate()}日の予定・タスク
              </h3>
              
              {/* Schedules */}
              {getDaySchedules(calendarSelectedDay).length > 0 && (
                <div className="mb-4">
                  <h4 className="font-semibold text-sm text-gray-500 mb-2">予定</h4>
                  <div className="space-y-2">
                    {getDaySchedules(calendarSelectedDay).map(schedule => (
                      <div key={schedule.id} className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg" data-testid={`calendar-schedule-${schedule.id}`}>
                        <Clock size={16} className="text-blue-500" />
                        <span className="flex-grow">{schedule.text}</span>
                        {schedule.time && (
                          <span className="text-xs text-gray-500">
                            {formatTime(schedule.time)}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Tasks */}
              {getDayTasks(calendarSelectedDay).length > 0 && (
                <div>
                  <h4 className="font-semibold text-sm text-gray-500 mb-2">タスク</h4>
                  <div className="space-y-2">
                    {getDayTasks(calendarSelectedDay).map(task => (
                      <div key={task.id} className="flex items-center gap-2 p-2 bg-theme-50 rounded-lg" data-testid={`calendar-task-${task.id}`}>
                        <input
                          type="checkbox"
                          checked={task.completed}
                          onChange={() => toggleTodo(task.id)}
                          className="h-4 w-4 rounded border-gray-300 text-theme-600 focus:ring-theme-500"
                        />
                        <span className={task.completed ? 'line-through text-gray-400 flex-grow' : 'flex-grow'}>
                          {task.text}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {getDaySchedules(calendarSelectedDay).length === 0 && getDayTasks(calendarSelectedDay).length === 0 && (
                <p className="text-gray-500 text-center py-4">この日の予定・タスクはありません</p>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderSettingsScreen = () => {
    const themeColors = [
      { value: 'pink', label: 'ピンク', color: 'bg-pink-500' },
      { value: 'blue', label: 'ブルー', color: 'bg-blue-500' },
      { value: 'green', label: 'グリーン', color: 'bg-green-500' },
      { value: 'purple', label: 'パープル', color: 'bg-purple-500' },
      { value: 'orange', label: 'オレンジ', color: 'bg-orange-500' }
    ];

    const handleSettingChange = async (key: string, value: any) => {
      try {
        await updateSettingsMutation.mutateAsync({ [key]: value });
      } catch (error) {
        console.error('Failed to update settings:', error);
      }
    };

    if (settingsLoading) {
      return (
        <div className="page p-4 flex items-center justify-center">
          <div className="text-gray-500">読み込み中...</div>
        </div>
      );
    }

    return (
      <div className="page p-4">
        <header className="flex items-center mb-6">
          <button 
            className="p-2 rounded-full hover:bg-gray-100"
            onClick={() => showScreen('home-screen')}
            data-testid="button-back"
          >
            <ArrowLeft size={24} />
          </button>
          <h2 className="text-xl font-bold mx-auto pr-8">設定</h2>
        </header>
        
        <div className="px-4 space-y-6">
          {/* Dark Mode Section */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b">
              <h3 className="text-sm font-semibold text-gray-500 uppercase">表示設定</h3>
            </div>
            <div className="p-4 flex items-center justify-between" style={{ minHeight: '56px' }}>
              <div>
                <div className="font-medium">ダークモード</div>
                <div className="text-sm text-gray-500">暗いテーマを使用</div>
              </div>
              <Switch
                checked={userSettings?.darkMode || false}
                onCheckedChange={(checked) => handleSettingChange('darkMode', checked)}
                data-testid="switch-dark-mode"
              />
            </div>
          </div>

          {/* Theme Color Section */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b">
              <h3 className="text-sm font-semibold text-gray-500 uppercase">テーマカラー</h3>
            </div>
            <div className="p-4 space-y-3">
              {themeColors.map((theme) => (
                <button
                  key={theme.value}
                  className={`w-full p-3 rounded-lg border-2 transition-all ${
                    userSettings?.themeColor === theme.value
                      ? 'border-theme-500 bg-theme-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleSettingChange('themeColor', theme.value)}
                  data-testid={`button-theme-${theme.value}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full ${theme.color}`} />
                    <span className="font-medium">{theme.label}</span>
                    {userSettings?.themeColor === theme.value && (
                      <span className="ml-auto text-theme-500">✓</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Push Notifications Section */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b">
              <h3 className="text-sm font-semibold text-gray-500 uppercase">通知設定</h3>
            </div>
            <div className="p-4 flex items-center justify-between" style={{ minHeight: '56px' }}>
              <div>
                <div className="font-medium">プッシュ通知</div>
                <div className="text-sm text-gray-500">タスクのリマインダーを受け取る</div>
              </div>
              <Switch
                checked={userSettings?.pushNotifications || false}
                onCheckedChange={(checked) => handleSettingChange('pushNotifications', checked)}
                data-testid="switch-push-notifications"
              />
            </div>
          </div>

        </div>
      </div>
    );
  };

  const renderLinksScreen = () => (
    <div className="page p-4">
      <header className="flex items-center mb-6">
        <button 
          className="p-2 rounded-full hover:bg-gray-100"
          onClick={() => showScreen('home-screen')}
          data-testid="button-back"
        >
          <ArrowLeft size={24} />
        </button>
        <h2 className="text-xl font-bold mx-auto pr-8">リンク集</h2>
      </header>

      <div className="space-y-4">
        <button
          onClick={() => setLinkInputVisible(true)}
          className="w-full py-3 px-4 bg-theme-500 text-white rounded-lg hover:bg-theme-600 transition-colors flex items-center justify-center gap-2"
          data-testid="button-add-link"
        >
          <Plus size={20} />
          リンクを追加
        </button>

        {linksLoading ? (
          <div className="text-center py-8 text-gray-500">読み込み中...</div>
        ) : links.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <LinkIcon size={48} className="mx-auto mb-2 opacity-50" />
            <p>保存されたリンクはありません</p>
            <p className="text-sm mt-1">YouTubeなどの動画リンクを保存できます</p>
          </div>
        ) : (
          <div className="space-y-3">
            {links.map(link => (
              <div key={link.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow" data-testid={`link-item-${link.id}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 mb-1 truncate" data-testid={`link-title-${link.id}`}>{link.title}</h3>
                    <a 
                      href={link.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-theme-600 hover:text-theme-700 break-all"
                      data-testid={`link-url-${link.id}`}
                    >
                      {link.url}
                    </a>
                    {link.category && (
                      <span className="inline-block mt-2 px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded" data-testid={`link-category-${link.id}`}>
                        {link.category === 'youtube' ? 'YouTube' : link.category === 'article' ? '記事' : 'その他'}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => deleteLinkMutation.mutate(link.id)}
                    className="text-red-500 hover:text-red-700 p-2"
                    data-testid={`button-delete-link-${link.id}`}
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {linkInputVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm">
            <h2 className="text-xl font-bold mb-4">リンクを追加</h2>
            <div className="space-y-3">
              <input
                type="text"
                value={linkTitle}
                onChange={(e) => setLinkTitle(e.target.value)}
                placeholder="タイトル"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-theme-500"
                data-testid="input-link-title"
              />
              <input
                type="url"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="URL (例: https://youtube.com/...)"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-theme-500"
                data-testid="input-link-url"
              />
              <select
                value={linkCategory}
                onChange={(e) => setLinkCategory(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-theme-500"
                data-testid="select-link-category"
              >
                <option value="youtube">YouTube</option>
                <option value="article">記事</option>
                <option value="other">その他</option>
              </select>
            </div>
            <div className="flex gap-2 mt-6">
              <button
                onClick={() => {
                  setLinkInputVisible(false);
                  setLinkTitle('');
                  setLinkUrl('');
                  setLinkCategory('other');
                }}
                className="flex-1 py-2 px-4 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                data-testid="button-cancel-link"
              >
                キャンセル
              </button>
              <button
                onClick={() => {
                  if (linkTitle.trim() && linkUrl.trim()) {
                    createLinkMutation.mutate({
                      title: linkTitle.trim(),
                      url: linkUrl.trim(),
                      category: linkCategory
                    });
                  }
                }}
                className="flex-1 py-2 px-4 bg-theme-500 text-white rounded-lg hover:bg-theme-600 transition-colors"
                data-testid="button-save-link"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderScreen = () => {
    // Show goal setup screen if it's the first time in a new month
    if (showGoalSetupScreen) {
      return renderMonthlyGoalScreen();
    }

    switch (currentScreen) {
      case 'home-screen':
        return renderHomeScreen();
      case 'tasks-screen':
        return renderTasksScreen();
      case 'pomodoro-screen':
        return renderPomodoroScreen();
      case 'sleep-detail-screen':
        return renderSleepDetailScreen();
      case 'body-detail-screen':
        return renderBodyDetailScreen();
      case 'diary-detail-screen':
        return renderDiaryDetailScreen();
      case 'daily-routine-screen':
        return renderDailyRoutineScreen();
      case 'monthly-goal-screen':
        return renderMonthlyGoalScreen();
      case 'weekly-review-screen':
        return renderWeeklyReviewScreen();
      case 'week-tracker-screen':
        return renderWeekTrackerScreen();
      case 'meal-detail-screen':
        return renderMealDetailScreen();
      case 'calendar-screen':
        return renderCalendarScreen();
      case 'settings-screen':
        return renderSettingsScreen();
      case 'links-screen':
        return renderLinksScreen();
      default:
        return renderHomeScreen();
    }
  };

  return (
    <div className="bg-theme-50 text-theme-900 min-h-screen">
      <div className="max-w-md mx-auto bg-white shadow-lg min-h-screen pb-24">
        {/* Schedule Modal */}
        {scheduleModalVisible && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm">
              <h2 className="text-xl font-bold mb-4">予定を追加</h2>
              <input 
                type="text" 
                placeholder="予定を入力" 
                value={scheduleInput}
                onChange={(e) => setScheduleInput(e.target.value)}
                className="form-input mb-4"
                data-testid="input-schedule"
              />
              <div className="flex justify-end space-x-3">
                <button 
                  className="btn-secondary"
                  onClick={() => setScheduleModalVisible(false)}
                  data-testid="button-cancel-schedule"
                >
                  キャンセル
                </button>
                <button 
                  className="btn-primary"
                  onClick={saveSchedule}
                  data-testid="button-save-schedule"
                >
                  保存
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Export Modal */}
        {exportModalVisible && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm">
              <h2 className="text-xl font-bold mb-4">データエクスポート</h2>
              <p className="text-sm text-gray-600 mb-6">
                すべてのデータをエクスポートします。形式を選択してください。
              </p>
              <div className="space-y-3">
                <button 
                  className="w-full btn-primary"
                  onClick={() => exportData('json')}
                  disabled={exportLoading}
                  data-testid="button-export-json"
                >
                  {exportLoading ? '処理中...' : 'JSON形式でエクスポート'}
                </button>
                <button 
                  className="w-full btn-secondary"
                  onClick={() => exportData('csv')}
                  disabled={exportLoading}
                  data-testid="button-export-csv"
                >
                  {exportLoading ? '処理中...' : 'CSV形式でエクスポート'}
                </button>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button 
                  className="btn-secondary"
                  onClick={() => setExportModalVisible(false)}
                  disabled={exportLoading}
                  data-testid="button-cancel-export"
                >
                  キャンセル
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Calendar Modal */}
        {calendarModalVisible && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">カレンダー</h2>
                <button 
                  className="text-gray-500 hover:text-gray-700"
                  onClick={() => setCalendarModalVisible(false)}
                  data-testid="button-close-calendar"
                >
                  ✕
                </button>
              </div>
              
              {/* Calendar Navigation */}
              <div className="flex justify-between items-center mb-4">
                <button 
                  className="btn-secondary"
                  onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, 1))}
                  data-testid="button-prev-month"
                >
                  ‹
                </button>
                <span className="font-medium" data-testid="text-current-month">
                  {selectedDate.getFullYear()}年{selectedDate.getMonth() + 1}月
                </span>
                <button 
                  className="btn-secondary"
                  onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 1))}
                  data-testid="button-next-month"
                >
                  ›
                </button>
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1 mb-4">
                {['日', '月', '火', '水', '木', '金', '土'].map(day => (
                  <div key={day} className="text-center p-2 font-medium text-gray-600 text-sm">
                    {day}
                  </div>
                ))}
                {(() => {
                  const year = selectedDate.getFullYear();
                  const month = selectedDate.getMonth();
                  const firstDay = new Date(year, month, 1);
                  const lastDay = new Date(year, month + 1, 0);
                  const startDate = new Date(firstDay);
                  startDate.setDate(startDate.getDate() - firstDay.getDay());
                  
                  const days = [];
                  for (let i = 0; i < 42; i++) {
                    const currentDate = new Date(startDate);
                    currentDate.setDate(startDate.getDate() + i);
                    const isCurrentMonth = currentDate.getMonth() === month;
                    const isToday = currentDate.toDateString() === new Date().toDateString();
                    const hasSchedule = schedules.some(schedule => 
                      schedule.date === currentDate.toLocaleDateString('sv-SE')
                    );
                    
                    days.push(
                      <button
                        key={i}
                        className={`p-2 text-sm rounded hover:bg-theme-100 relative ${
                          isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
                        } ${isToday ? 'bg-theme-500 text-white hover:bg-theme-600' : ''}`}
                        onClick={() => {
                          if (isCurrentMonth) {
                            setSelectedDate(new Date(currentDate));
                            addScheduleForDate(new Date(currentDate));
                          }
                        }}
                        data-testid={`calendar-day-${currentDate.getDate()}`}
                      >
                        {currentDate.getDate()}
                        {hasSchedule && isCurrentMonth && (
                          <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-theme-500 rounded-full"></div>
                        )}
                      </button>
                    );
                  }
                  return days;
                })()}
              </div>

              {/* Selected Date Schedules */}
              <div className="border-t pt-4">
                <h3 className="font-medium mb-2">選択日の予定</h3>
                {(() => {
                  const selectedDateStr = selectedDate.toLocaleDateString('sv-SE');
                  const daySchedules = schedules.filter(s => s.date === selectedDateStr);
                  return daySchedules.length > 0 ? (
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {daySchedules.map(schedule => (
                        <div key={schedule.id} className="text-sm p-2 bg-gray-50 rounded" data-testid={`schedule-${schedule.id}`}>
                          {schedule.text}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">予定がありません</p>
                  );
                })()}
              </div>
            </div>
          </div>
        )}

        {/* TODO Input Modal */}
        {todoInputModalVisible && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm">
              <h2 className="text-xl font-bold mb-4">TODO追加</h2>
              <input
                type="text"
                placeholder="TODOを入力してください"
                value={todoInputText}
                onChange={(e) => setTodoInputText(e.target.value)}
                className="form-input mb-4 w-full"
                data-testid="input-todo-text"
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && repeatType === 'none') {
                    saveTodoInput();
                  }
                }}
                autoFocus
              />
              
              {/* 繰り返し設定 */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">繰り返し設定</label>
                <select
                  value={repeatType}
                  onChange={(e) => setRepeatType(e.target.value as any)}
                  className="form-input w-full"
                  data-testid="select-repeat-type"
                >
                  <option value="none">繰り返しなし</option>
                  <option value="daily">毎日</option>
                  <option value="weekly">毎週</option>
                  <option value="monthly">毎月</option>
                </select>
              </div>

              {/* 曜日選択（毎週の場合） */}
              {repeatType === 'weekly' && (
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">曜日を選択</label>
                  <div className="flex flex-wrap gap-2">
                    {['日', '月', '火', '水', '木', '金', '土'].map((day, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => {
                          if (repeatDays.includes(index)) {
                            setRepeatDays(repeatDays.filter(d => d !== index));
                          } else {
                            setRepeatDays([...repeatDays, index]);
                          }
                        }}
                        className={`px-3 py-1 rounded-full text-sm ${
                          repeatDays.includes(index)
                            ? 'bg-theme-500 text-white'
                            : 'bg-gray-200 text-gray-700'
                        }`}
                        data-testid={`button-weekday-${index}`}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 日付選択（毎月の場合） */}
              {repeatType === 'monthly' && (
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">日付を選択</label>
                  <select
                    value={repeatDate || ''}
                    onChange={(e) => setRepeatDate(e.target.value ? parseInt(e.target.value) : null)}
                    className="form-input w-full"
                    data-testid="select-repeat-date"
                  >
                    <option value="">日付を選択</option>
                    {Array.from({ length: 31 }, (_, i) => i + 1).map(date => (
                      <option key={date} value={date}>{date}日</option>
                    ))}
                  </select>
                </div>
              )}

              {/* 位置情報設定 */}
              <div className="mb-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={locationEnabled}
                    onChange={(e) => setLocationEnabled(e.target.checked)}
                    className="mr-2"
                    data-testid="checkbox-location-enabled"
                  />
                  <span className="text-sm font-medium">位置情報ベースの通知</span>
                </label>
              </div>

              {locationEnabled && (
                <div className="mb-4 space-y-3">
                  <div>
                    <label className="block text-sm font-medium mb-2">場所名</label>
                    <input
                      type="text"
                      value={locationName}
                      onChange={(e) => setLocationName(e.target.value)}
                      placeholder="例: 自宅、オフィス"
                      className="form-input w-full"
                      data-testid="input-location-name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">半径 (m)</label>
                    <input
                      type="number"
                      value={locationRadius}
                      onChange={(e) => setLocationRadius(parseInt(e.target.value) || 100)}
                      className="form-input w-full"
                      data-testid="input-location-radius"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={getCurrentLocation}
                    className="w-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                    data-testid="button-get-current-location"
                  >
                    現在位置を取得
                  </button>
                  {locationLat && locationLng && (
                    <div className="text-xs text-gray-500">
                      位置: {locationLat.toFixed(4)}, {locationLng.toFixed(4)}
                    </div>
                  )}
                </div>
              )}
              
              <div className="flex justify-end space-x-3">
                <button 
                  className="btn-secondary"
                  onClick={() => {
                    setTodoInputModalVisible(false);
                    setTodoInputText('');
                    setRepeatType('none');
                    setRepeatDays([]);
                    setRepeatDate(null);
                    setLocationEnabled(false);
                    setLocationName('');
                    setLocationLat(null);
                    setLocationLng(null);
                    setLocationRadius(100);
                  }}
                  data-testid="button-close-todo-input"
                >
                  完了
                </button>
                <button 
                  className="btn-primary"
                  onClick={saveTodoInput}
                  disabled={!todoInputText.trim()}
                  data-testid="button-save-todo"
                >
                  追加
                </button>
              </div>
              <div className="mt-3 text-sm text-gray-600">
                Enterキーでも追加できます。「完了」を押すまで続けて追加できます。
              </div>
            </div>
          </div>
        )}

        {/* Schedule Input Modal */}
        {scheduleInputModalVisible && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm">
              <h2 className="text-xl font-bold mb-4">
                予定追加 - {scheduleInputDate?.getFullYear()}年{(scheduleInputDate?.getMonth() ?? 0) + 1}月{scheduleInputDate?.getDate()}日
              </h2>
              <input
                type="text"
                placeholder="予定を入力してください"
                value={scheduleInputText}
                onChange={(e) => setScheduleInputText(e.target.value)}
                className="form-input mb-4 w-full"
                data-testid="input-schedule-text"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    saveScheduleInput();
                  }
                }}
                autoFocus
              />
              <div className="flex justify-end space-x-3">
                <button 
                  className="btn-secondary"
                  onClick={() => {
                    setScheduleInputModalVisible(false);
                    setScheduleInputText('');
                    setCalendarModalVisible(true);
                  }}
                  data-testid="button-cancel-schedule-input"
                >
                  キャンセル
                </button>
                <button 
                  className="btn-primary"
                  onClick={saveScheduleInput}
                  disabled={!scheduleInputText.trim()}
                  data-testid="button-save-schedule-input"
                >
                  保存
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Notification Modal */}
        {notificationModalVisible && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm">
              <h2 className="text-xl font-bold mb-4">通知設定</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">通知を有効にする</span>
                  <button
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      notificationsEnabled ? 'bg-theme-500' : 'bg-gray-200'
                    }`}
                    onClick={toggleNotifications}
                    data-testid="toggle-notifications"
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        notificationsEnabled ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
                <div className="text-sm text-gray-600">
                  {notificationPermission === 'denied' && (
                    <p className="text-red-600">ブラウザの通知がブロックされています。ブラウザ設定で通知を許可してください。</p>
                  )}
                  {notificationPermission === 'default' && (
                    <p>通知を有効にすると、タスクと予定のリマインダーが表示されます。</p>
                  )}
                  {notificationPermission === 'granted' && notificationsEnabled && (
                    <p className="text-green-600">通知が有効になっています。30分ごとにリマインダーを確認します。</p>
                  )}
                  {notificationPermission === 'granted' && !notificationsEnabled && (
                    <p>通知は無効になっています。</p>
                  )}
                </div>
                {notificationsEnabled && (
                  <button 
                    className="w-full btn-secondary"
                    onClick={checkTaskReminders}
                    data-testid="button-test-notification"
                  >
                    今すぐリマインダーを確認
                  </button>
                )}
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button 
                  className="btn-secondary"
                  onClick={() => setNotificationModalVisible(false)}
                  data-testid="button-close-notification"
                >
                  閉じる
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <header className="sticky top-0 bg-white/80 backdrop-blur-sm z-10 px-4 py-3 flex justify-between items-center border-b border-theme-200">
          <h1 className="text-lg font-bold text-gray-900">タスク管理</h1>
          <div className="text-sm font-medium text-gray-600" data-testid="text-header-date">
            {getCurrentDate()}
          </div>
          <div className="flex items-center space-x-3">
            <button 
              className={`transition-colors ${notificationsEnabled ? 'text-theme-500 hover:text-theme-600' : 'text-gray-500 hover:text-theme-500'}`}
              onClick={() => setNotificationModalVisible(true)}
              data-testid="button-notification"
              title="通知設定"
            >
              <Bell size={24} />
            </button>
            <button 
              className="text-gray-500 hover:text-theme-500 transition-colors"
              onClick={() => setExportModalVisible(true)}
              data-testid="button-export"
              title="データエクスポート"
            >
              <Download size={20} />
            </button>
          </div>
        </header>

        {/* Main Content */}
        <main>
          {renderScreen()}
        </main>

        {/* Bottom Navigation */}
        <nav className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-md bg-white border-t border-theme-200 flex">
          <button 
            className={`nav-btn flex-1 flex flex-col items-center py-2 text-center ${
              currentScreen === 'home-screen' ? 'nav-active' : ''
            }`}
            onClick={() => showScreen('home-screen')}
            data-testid="nav-home"
          >
            <Home size={24} className="mb-1" />
            <span className="text-xs">ホーム</span>
          </button>
          <button 
            className={`nav-btn flex-1 flex flex-col items-center py-2 text-center ${
              currentScreen === 'tasks-screen' ? 'nav-active' : ''
            }`}
            onClick={() => showScreen('tasks-screen')}
            data-testid="nav-tasks"
          >
            <ListChecks size={24} className="mb-1" />
            <span className="text-xs">タスク管理</span>
          </button>
        </nav>
      </div>
    </div>
  );
};

export default TaskManager;
