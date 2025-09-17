import React, { useState, useEffect, useRef } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
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
  Smile
} from 'lucide-react';

const TaskManager: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState('home-screen');
  const [todoVisible, setTodoVisible] = useLocalStorage('todoVisible', false);
  const [todos, setTodos] = useLocalStorage<Todo[]>('todos', []);
  const [schedules, setSchedules] = useLocalStorage<Schedule[]>('schedules', []);
  const [sleepRecords, setSleepRecords] = useLocalStorage<SleepRecord[]>('sleepRecords', []);
  const [weightRecords, setWeightRecords] = useLocalStorage<WeightRecord[]>('weightRecords', []);
  const [mealRecords, setMealRecords] = useLocalStorage<MealRecord[]>('mealRecords', []);
  const [diaryEntries, setDiaryEntries] = useLocalStorage<DiaryEntry[]>('diaryEntries', []);
  const [pendingBedtime, setPendingBedtime] = useLocalStorage<Date | null>('pendingBedtime', null);
  const [pendingWakeupTime, setPendingWakeupTime] = useLocalStorage<Date | null>('pendingWakeupTime', null);
  
  const [pomodoro, setPomodoro] = useState<PomodoroState>({
    minutes: 25,
    seconds: 0,
    isRunning: false,
    mode: 'pomodoro'
  });

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
      const newTodo: Todo = {
        id: Date.now(),
        text: text.trim(),
        completed: false,
        createdAt: new Date()
      };
      setTodos((prev: Todo[]) => [...prev, newTodo]);
      if (!todoVisible) {
        setTodoVisible(true);
      }
    }
  };

  const toggleTodo = (id: number) => {
    setTodos((prev: Todo[]) => prev.map((todo: Todo) => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const deleteTodo = (id: number) => {
    setTodos((prev: Todo[]) => prev.filter((todo: Todo) => todo.id !== id));
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
    
    const newSleepRecord: SleepRecord = {
      id: Date.now(),
      date: todayDate,
      bedtime: pendingBedtime,
      wakeup: now,
      duration
    };
    
    setSleepRecords((prev: SleepRecord[]) => [...prev, newSleepRecord]);
    setPendingBedtime(null);
    setPendingWakeupTime(null);
  };

  const deleteBedtime = () => {
    setPendingBedtime(null);
  };

  const saveSchedule = () => {
    if (scheduleInput.trim()) {
      const newSchedule: Schedule = {
        id: Date.now(),
        text: scheduleInput.trim(),
        date: new Date().toISOString().split('T')[0],
        time: new Date(),
        completed: false
      };
      setSchedules((prev: Schedule[]) => [...prev, newSchedule]);
      setScheduleInput('');
      setScheduleModalVisible(false);
    }
  };

  const saveWeight = () => {
    if (weightInput.trim()) {
      const weight = parseFloat(weightInput);
      if (!isNaN(weight)) {
        const newRecord: WeightRecord = {
          id: Date.now(),
          date: new Date().toISOString().split('T')[0],
          weight,
          bodyFat: bodyFatInput ? parseFloat(bodyFatInput) : undefined
        };
        setWeightRecords((prev: WeightRecord[]) => [...prev, newRecord]);
        setWeightInput('');
        setBodyFatInput('');
      }
    }
  };

  const saveDiary = () => {
    if (diaryText.trim()) {
      const newEntry: DiaryEntry = {
        id: Date.now(),
        date: new Date().toISOString().split('T')[0],
        content: diaryText.trim()
      };
      setDiaryEntries((prev: DiaryEntry[]) => [...prev, newEntry]);
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
        {getTodaysSchedules().length > 0 && (
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
              {getTodaysSleep() ? formatDuration(getTodaysSleep()!.duration) : '未記録'}
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
              {weightRecords.length > 0 ? `${weightRecords[weightRecords.length - 1].weight} kg` : '65.2 kg'}
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
                {weightRecords.length > 0 ? weightRecords[weightRecords.length - 1].weight : '65.2'}
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

        {/* Header */}
        <header className="sticky top-0 bg-white/80 backdrop-blur-sm z-10 px-4 py-3 flex justify-between items-center border-b border-theme-200">
          <h1 className="text-lg font-bold text-gray-900">タスク管理</h1>
          <div className="text-sm font-medium text-gray-600" data-testid="text-header-date">
            {getCurrentDate()}
          </div>
          <div className="flex items-center space-x-4">
            <button className="text-gray-500 hover:text-theme-500 transition-colors" data-testid="button-notification">
              <Bell size={24} />
            </button>
            <button 
              className="text-gray-500 hover:text-theme-500 transition-colors"
              onClick={() => showScreen('pomodoro-screen')}
              data-testid="button-clock"
            >
              <Clock size={24} />
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
            onClick={() => setScheduleModalVisible(true)}
            data-testid="nav-schedule"
          >
            <Calendar size={24} className="mb-1" />
            <span className="text-xs">スケジュール</span>
          </button>
        </nav>
      </div>
    </div>
  );
};

export default TaskManager;
