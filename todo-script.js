document.addEventListener('DOMContentLoaded', function () {
   // DOM Elements
   const taskForm = document.getElementById('task-form');
   const taskInput = document.getElementById('task-input');
   const taskList = document.getElementById('task-list');
   const emptyState = document.getElementById('empty-state');
   const taskCount = document.getElementById('task-count');
   const clearCompletedBtn = document.getElementById('clear-completed');
   const filterAllBtn = document.getElementById('filter-all');
   const filterActiveBtn = document.getElementById('filter-active');
   const filterCompletedBtn = document.getElementById('filter-completed');
   const themeToggle = document.getElementById('theme-toggle');
   const sunIcon = document.getElementById('sun-icon');
   const moonIcon = document.getElementById('moon-icon');

   let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
   let currentFilter = 'all';

   // Theme Management
   function initTheme() {
      const savedTheme = localStorage.getItem('theme') || 'light';
      document.documentElement.classList.toggle('dark', savedTheme === 'dark');
      sunIcon.classList.toggle('hidden', savedTheme === 'dark');
      moonIcon.classList.toggle('hidden', savedTheme !== 'dark');
   }

   function toggleTheme() {
      const isDark = document.documentElement.classList.toggle('dark');
      localStorage.setItem('theme', isDark ? 'dark' : 'light');
      sunIcon.classList.toggle('hidden', isDark);
      moonIcon.classList.toggle('hidden', !isDark);
   }

   themeToggle.addEventListener('click', toggleTheme);

   // Initialize the app
   function init() {
      initTheme();
      renderTaskList();
      updateTaskCount();
      updateEmptyState();
   }

   // Add new task
   taskForm.addEventListener('submit', function (e) {
      e.preventDefault();

      const taskText = taskInput.value.trim();
      if (taskText === '') return;

      const newTask = {
         id: Date.now(),
         text: taskText,
         completed: false,
         createdAt: new Date().toISOString()
      };

      tasks.unshift(newTask);
      saveTasks();
      renderTaskList();
      updateTaskCount();
      updateEmptyState();

      taskInput.value = '';
      taskInput.focus();
   });

   // Render task list based on current filter
   function renderTaskList() {
      taskList.innerHTML = '';

      let filteredTasks = tasks;

      if (currentFilter === 'active') {
         filteredTasks = tasks.filter(task => !task.completed);
      } else if (currentFilter === 'completed') {
         filteredTasks = tasks.filter(task => task.completed);
      }

      if (filteredTasks.length === 0) {
         const message = currentFilter === 'all'
            ? 'No tasks yet. Add a task to get started!'
            : currentFilter === 'active'
               ? 'No active tasks'
               : 'No completed tasks';

         emptyState.textContent = message;
         taskList.appendChild(emptyState);
         return;
      }

      filteredTasks.forEach(task => {
         const taskItem = document.createElement('li');
         taskItem.className = 'task-item py-4 px-2 flex items-center';
         taskItem.dataset.id = task.id;

         if (task.completed) {
            taskItem.classList.add('completed');
         }

         taskItem.innerHTML = `
                        <div class="flex items-center flex-grow">
                            <input 
                                type="checkbox" 
                                ${task.completed ? 'checked' : ''}
                                class="mr-3 h-5 w-5 rounded border-theme text-primary focus:ring-primary cursor-pointer bg-transparent"
                            >
                            <span class="flex-grow ${task.completed ? 'line-through text-slate-400' : 'text-theme'}">${task.text}</span>
                            <button class="delete-btn ml-2 text-slate-400 hover:text-rose-500">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </button>
                        </div>
                    `;

         taskList.appendChild(taskItem);
      });

      // Add event listeners to checkboxes and delete buttons
      document.querySelectorAll('.task-item input[type="checkbox"]').forEach(checkbox => {
         checkbox.addEventListener('change', function () {
            const taskId = parseInt(this.closest('.task-item').dataset.id);
            toggleTaskCompleted(taskId);
         });
      });

      document.querySelectorAll('.delete-btn').forEach(btn => {
         btn.addEventListener('click', function () {
            const taskId = parseInt(this.closest('.task-item').dataset.id);
            deleteTask(taskId);
         });
      });
   }

   // Toggle task completed status
   function toggleTaskCompleted(taskId) {
      tasks = tasks.map(task => {
         if (task.id === taskId) {
            return { ...task, completed: !task.completed };
         }
         return task;
      });

      saveTasks();
      renderTaskList();
      updateTaskCount();
   }

   // Delete task
   function deleteTask(taskId) {
      tasks = tasks.filter(task => task.id !== taskId);
      saveTasks();
      renderTaskList();
      updateTaskCount();
      updateEmptyState();
   }

   // Clear all completed tasks
   clearCompletedBtn.addEventListener('click', function () {
      tasks = tasks.filter(task => !task.completed);
      saveTasks();
      renderTaskList();
      updateTaskCount();
      updateEmptyState();
   });

   // Filter tasks
   filterAllBtn.addEventListener('click', function () {
      currentFilter = 'all';
      updateActiveFilter();
      renderTaskList();
   });

   filterActiveBtn.addEventListener('click', function () {
      currentFilter = 'active';
      updateActiveFilter();
      renderTaskList();
   });

   filterCompletedBtn.addEventListener('click', function () {
      currentFilter = 'completed';
      updateActiveFilter();
      renderTaskList();
   });

   // Update active filter button style
   function updateActiveFilter() {
      document.querySelectorAll('.filter-btn').forEach(btn => {
         btn.classList.remove('active');
      });

      const activeBtn = currentFilter === 'all' ? filterAllBtn :
         currentFilter === 'active' ? filterActiveBtn : filterCompletedBtn;

      activeBtn.classList.add('active');
   }

   // Update task count
   function updateTaskCount() {
      const activeTasks = tasks.filter(task => !task.completed).length;
      const totalTasks = tasks.length;

      if (totalTasks === 0) {
         taskCount.textContent = '0 tasks';
      } else {
         taskCount.textContent = `${activeTasks} of ${totalTasks} tasks remaining`;
      }
   }

   // Show/hide empty state
   function updateEmptyState() {
      if (tasks.length === 0) {
         emptyState.style.display = 'block';
      } else {
         emptyState.style.display = 'none';
      }
   }

   // Save tasks to localStorage
   function saveTasks() {
      localStorage.setItem('tasks', JSON.stringify(tasks));
   }

   // Initialize the app
   init();
});