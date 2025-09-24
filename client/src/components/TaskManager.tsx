import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Todo, 
  Schedule, 
  SleepRecord, 
  WeightRecord, 
  MealRecord, 
  DiaryEntry, 
  PomodoroState,
  AppState 
} from '../types';
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
  Download
} from 'lucide-react';

const TaskManager: React.FC = () => {
  const { user, logout } = useAuth();
  const [currentScreen, setCurrentScreen] = useState('home-screen');
  const [todoVisible, setTodoVisible] = useLocalStorage('todoVisible', false);
  const [pendingBedtime, setPendingBedtime] = useLocalStorage<Date | null>('pendingBedtime', null);
  const [pendingWakeupTime, setPendingWakeupTime] = useLocalStorage<Date | null>('pendingWakeupTime', null);
  
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

  // React Query hooks for data fetching
  const { data: todos = [], isLoading: todosLoading } = useQuery<Todo[]>({
    queryKey: ['/api/todos'],
    queryFn: () => fetch('/api/todos', { credentials: 'include' }).then(res => res.json())
      .then((todos: any[]) => todos.map(todo => ({
        ...todo,
        createdAt: new Date(todo.createdAt)
      })))
  });

  const { data: schedules = [], isLoading: schedulesLoading } = useQuery<Schedule[]>({
    queryKey: ['/api/schedules'],
    queryFn: () => fetch('/api/schedules', { credentials: 'include' }).then(res => res.json())
      .then((schedules: any[]) => schedules.map(schedule => ({
        ...schedule,
        time: schedule.time ? new Date(schedule.time) : null
      })))
  });

  const { data: sleepRecords = [], isLoading: sleepRecordsLoading } = useQuery<SleepRecord[]>({
    queryKey: ['/api/sleep-records'],
    queryFn: () => fetch('/api/sleep-records', { credentials: 'include' }).then(res => res.json())
      .then((records: any[]) => records.map(record => ({
        ...record,
        bedtime: new Date(record.bedtime),
        wakeup: new Date(record.wakeup)
      })))
  });

  const { data: weightRecords = [], isLoading: weightRecordsLoading } = useQuery<WeightRecord[]>({
    queryKey: ['/api/weight-records'],
    queryFn: () => fetch('/api/weight-records', { credentials: 'include' }).then(res => res.json())
  });

  const { data: mealRecords = [], isLoading: mealRecordsLoading } = useQuery<MealRecord[]>({
    queryKey: ['/api/meal-records'],
    queryFn: () => fetch('/api/meal-records', { credentials: 'include' }).then(res => res.json())
  });

  const { data: diaryEntries = [], isLoading: diaryEntriesLoading } = useQuery<DiaryEntry[]>({
    queryKey: ['/api/diary-entries'],
    queryFn: () => fetch('/api/diary-entries', { credentials: 'include' }).then(res => res.json())
  });
  
  const [pomodoro, setPomodoro] = useState<PomodoroState>({
    minutes: 25,
    seconds: 0,
    isRunning: false,
    mode: 'pomodoro'
  });

  // Mutation hooks for CRUD operations
  const createTodoMutation = useMutation({
    mutationFn: (todoData: { text: string; completed?: boolean }) =>
      apiRequest('POST', '/api/todos', todoData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/todos'] });
    }
  });

  const updateTodoMutation = useMutation({
    mutationFn: ({ id, ...data }: { id: string; completed?: boolean }) =>
      apiRequest('PUT', `/api/todos/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/todos'] });
    }
  });

  const deleteTodoMutation = useMutation({
    mutationFn: (id: string) => apiRequest('DELETE', `/api/todos/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/todos'] });
    }
  });

  const createScheduleMutation = useMutation({
    mutationFn: (scheduleData: { text: string; date: string; time?: Date; completed?: boolean }) =>
      apiRequest('POST', '/api/schedules', scheduleData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/schedules'] });
    }
  });

  const createSleepRecordMutation = useMutation({
    mutationFn: (sleepData: { date: string; bedtime: Date; wakeup: Date; duration: number }) =>
      apiRequest('POST', '/api/sleep-records', sleepData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/sleep-records'] });
    }
  });

  const createWeightRecordMutation = useMutation({
    mutationFn: (weightData: { date: string; weight: string; bodyFat?: string }) =>
      apiRequest('POST', '/api/weight-records', weightData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/weight-records'] });
    }
  });

  const createDiaryEntryMutation = useMutation({
    mutationFn: (diaryData: { date: string; content: string; mood?: string; photos?: string[] }) =>
      apiRequest('POST', '/api/diary-entries', diaryData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/diary-entries'] });
    }
  });

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
      const response = await fetch('/api/export', { credentials: 'include' });
      if (!response.ok) {
        throw new Error('エクスポートに失敗しました');
      }
      
      const exportData = await response.json();
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
          { name: 'diary-entries', data: data.diaryEntries }
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

  const [scheduleModalVisible, setScheduleModalVisible] = useState(false);
  const [scheduleInput, setScheduleInput] = useState('');
  const [diaryText, setDiaryText] = useState('');
  const [weightInput, setWeightInput] = useState('');
  const [bodyFatInput, setBodyFatInput] = useState('');

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

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

  const getCurrentDate = () => {
    return new Date().toLocaleDateString('ja-JP', {
      month: 'short',
      day: 'numeric',
      weekday: 'short'
    });
  };

  const showScreen = (screenId: string) => {
    setCurrentScreen(screenId);
    window.scrollTo(0, 0);
  };

  const addTodo = () => {
    const text = prompt('TODOを入力してください:');
    if (text?.trim()) {
      createTodoMutation.mutate({
        text: text.trim(),
        completed: false
      });
      if (!todoVisible) {
        setTodoVisible(true);
      }
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

  const recordBedtime = () => {
    const now = new Date();
    setPendingBedtime(now);
  };

  const recordWakeup = () => {
    if (!pendingBedtime) return;
    
    const now = new Date();
    const duration = now.getTime() - pendingBedtime.getTime();
    const todayDate = new Date().toISOString().split('T')[0];
    
    createSleepRecordMutation.mutate({
      date: todayDate,
      bedtime: pendingBedtime,
      wakeup: now,
      duration
    });
    setPendingBedtime(null);
    setPendingWakeupTime(null);
  };

  const deleteBedtime = () => {
    setPendingBedtime(null);
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
          weight: weight.toString(),
          bodyFat: bodyFatInput ? parseFloat(bodyFatInput).toString() : undefined
        });
        setWeightInput('');
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
              {weightRecordsLoading ? 'Loading...' : weightRecords.length > 0 ? `${parseFloat(weightRecords[weightRecords.length - 1].weight)} kg` : '65.2 kg'}
            </p>
          </div>
          <div 
            className="record-card" 
            onClick={() => showScreen('diary-detail-screen')}
            data-testid="card-diary"
          >
            <h3 className="font-bold">メモ</h3>
            <p className="text-sm text-gray-500">今日の振り返り...</p>
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
        <h2 className="text-xl font-bold mx-auto pr-8">ポモドーロタイマー</h2>
      </header>
      <div className="bg-white rounded-lg shadow-inner p-6">
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
        {/* Pending Sleep Record */}
        <div className="bg-white rounded-lg shadow p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-500">就寝時間</label>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-semibold" data-testid="text-pending-bedtime">
                {formatTime(pendingBedtime)}
              </span>
              <div className="flex items-center space-x-2">
                {pendingBedtime && (
                  <button 
                    className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
                    onClick={deleteBedtime}
                    data-testid="button-delete-bedtime"
                  >
                    <X size={16} strokeWidth={3} />
                  </button>
                )}
                <button 
                  className="px-4 py-2 bg-theme-500 text-white rounded-lg hover:bg-theme-600 w-20 text-center"
                  onClick={recordBedtime}
                  data-testid="button-record-bedtime"
                >
                  記録
                </button>
              </div>
            </div>
          </div>
          
          {pendingBedtime && (
            <div>
              <hr />
              <label className="block text-sm font-medium text-gray-500">起床時間</label>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-semibold" data-testid="text-pending-wakeup">--:--</span>
                <button 
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 w-20 text-center"
                  onClick={recordWakeup}
                  data-testid="button-record-wakeup"
                >
                  記録
                </button>
              </div>
            </div>
          )}
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
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-theme-600" data-testid="text-current-weight">
                {weightRecords.length > 0 ? parseFloat(weightRecords[weightRecords.length - 1].weight) : '65.2'}
              </div>
              <div className="text-sm text-gray-500">体重 (kg)</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-theme-600">22.4</div>
              <div className="text-sm text-gray-500">BMI</div>
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
          <h3 className="font-bold text-lg mb-4">今日の振り返り</h3>
          <textarea 
            placeholder="今日はどんな一日でしたか？" 
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
          <h3 className="font-bold text-lg mb-4">過去の記録</h3>
          <div className="space-y-3">
            {diaryEntries.slice(-5).reverse().map(entry => (
              <div key={entry.id} className="p-3 border rounded-lg">
                <div className="text-sm text-gray-500 mb-1">{entry.date}</div>
                <div className="text-sm">{entry.content}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

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

  const renderScreen = () => {
    switch (currentScreen) {
      case 'home-screen':
        return renderHomeScreen();
      case 'pomodoro-screen':
        return renderPomodoroScreen();
      case 'sleep-detail-screen':
        return renderSleepDetailScreen();
      case 'body-detail-screen':
        return renderBodyDetailScreen();
      case 'diary-detail-screen':
        return renderDiaryDetailScreen();
      case 'meal-detail-screen':
        return renderMealDetailScreen();
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
            <div className="flex items-center space-x-2 mr-2">
              <User size={16} className="text-gray-500" />
              <span className="text-sm text-gray-600" data-testid="text-username">
                {user?.username}
              </span>
            </div>
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
            <button 
              className="text-gray-500 hover:text-red-500 transition-colors"
              onClick={logout}
              data-testid="button-logout"
              title="ログアウト"
            >
              <LogOut size={20} />
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
              currentScreen === 'pomodoro-screen' ? 'nav-active' : ''
            }`}
            onClick={() => showScreen('pomodoro-screen')}
            data-testid="nav-timer"
          >
            <Timer size={24} className="mb-1" />
            <span className="text-xs">タイマー</span>
          </button>
          <button 
            className="nav-btn flex-1 flex flex-col items-center py-2 text-center"
            onClick={() => setCalendarModalVisible(true)}
            data-testid="nav-calendar"
          >
            <Calendar size={24} className="mb-1" />
            <span className="text-xs">カレンダー</span>
          </button>
        </nav>
      </div>
    </div>
  );
};

export default TaskManager;
