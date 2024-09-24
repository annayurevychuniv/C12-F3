let app = Vue.createApp({
    data: function () {
        return {
            todos: [],
            input_content: '',
            input_category: ''
        };
    },
    computed: {
        todos_asc() {
            return this.todos.slice().sort((a, b) => {
                return b.date - a.date;
            });
        }
    },
    methods: {
        addTodo() {
            if (this.input_content.trim() === '' || this.input_category === '') {
                return;
            } else {
                this.todos.push({
                    content: this.input_content,
                    category: this.input_category,
                    done: false,
                    date: new Date().getTime()
                });
                this.input_content = '';
                this.input_category = '';
                this.sendUpdate();
            }
        },
        removeTodo(todo) {
            this.todos = this.todos.filter(t => t !== todo);
            this.sendUpdate();
        },
        saveNewOrder(newOrder) {
            this.todos = newOrder;
            this.sendUpdate();
        },
        sendUpdate() {
            const data = JSON.stringify(this.todos);
            console.log("Відправляємо оновлення через WebSocket:", data);
            if (this.socket.readyState === WebSocket.OPEN) {
                this.socket.send(data);
            }
        },
        receiveUpdate(data) {
            try {
                const parsedData = JSON.parse(data);
                console.log("Оновлення списку задач від WebSocket:", parsedData);
                this.todos = parsedData;
            } catch (e) {
                console.error("Помилка при парсингу даних WebSocket:", e);
            }
        }
    },
    watch: {
        todos: {
            handler: function (newVal) {
                localStorage.setItem("todos", JSON.stringify(newVal));
            },
            deep: true
        }
    },
    mounted() {
        this.todos = JSON.parse(localStorage.getItem('todos')) || [];

        let el = this.$refs.todoList;
        Sortable.create(el, {
            onEnd: (event) => {
                let newOrder = [...this.todos];
                const movedItem = newOrder.splice(event.oldIndex, 1)[0];
                newOrder.splice(event.newIndex, 0, movedItem);
                this.saveNewOrder(newOrder);
            }
        });

        this.socket = new WebSocket('ws://localhost:8080');
        this.socket.onmessage = (event) => {
            console.log("Отримано дані від WebSocket сервера:", event.data);

            if (event.data instanceof Blob) {
                const reader = new FileReader();
                reader.onload = () => {
                    this.receiveUpdate(reader.result);
                };
                reader.readAsText(event.data);
            } else {
                this.receiveUpdate(event.data);
            }
        };
        this.socket.onopen = () => {
            console.log("WebSocket з'єднання відкрите.");
            this.sendUpdate();
        };
        this.socket.onclose = () => {
            console.log("WebSocket з'єднання закрите.");
        };
    },
    template: `
        <main class="app">
            <section class="greeting">
                <h2 class="title">
                    What's up?
                </h2>
            </section>
            <section class="create-todo">
                <h3>CREATE A TODO</h3>
                <form @submit.prevent="addTodo">
                    <h4>Let's list some plans of yours</h4>
                    <input type="text" placeholder="e. g. make a paper clown head" v-model="input_content" />
                    <h4>Pick a category</h4>
                    <div class="options">
                        <label>
                            <input type="radio" name="category" value="business" v-model="input_category" />
                            <span class="bubble business"></span>
                            <div>Business</div>
                        </label>
                        <label>
                            <input type="radio" name="category" value="personal" v-model="input_category" />
                            <span class="bubble personal"></span>
                            <div>Personal</div>
                        </label>
                    </div>
                    <input type="submit" value="Add todo" />
                </form>
            </section>
            <section class="todo-list">
                <h3>TODO LIST</h3>
                <div class="list" ref="todoList">
                    <div v-for="todo in todos_asc" :class="'todo-item ' + (todo.done && 'done') ">
                        <div class="item-block">
                            <label>
                                <input type="checkbox" v-model="todo.done" />
                                <span :class="'bubble ' + todo.category"></span>
                            </label>
                            <div>
                                <input type="text" v-model="todo.content" />
                            </div>
                        </div>
                        <div class="actions">
                            <button class="delete" @click="removeTodo(todo)">Remove</button>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    `
});

app.mount('#root');
