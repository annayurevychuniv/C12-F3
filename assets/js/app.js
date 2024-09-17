let app = Vue.createApp({
    data: function () {
        return {
            todos: [],
            person: '',
            input_content: '',
            input_category: ''
        }
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
            }
        },
        removeTodo(todo) {
            this.todos = this.todos.filter(t => t !== todo);
        },
        saveNewOrder(newOrder) {
            this.todos = newOrder;
        }
    },
    watch: {
        person(newVal) {
            localStorage.setItem("person", newVal);
        },
        todos: {
            handler: function (newVal) {
                localStorage.setItem("todos", JSON.stringify(newVal));
            },
            deep: true
        }
    },
    template: `
        <main class="app">
            <section class="greeting">
                <h2 class="title">
                    What's up, <input v-model="person" placeholder="Enter your name" />
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
