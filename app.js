// =============== header > tab_menu ===============
const showBtns = document.querySelectorAll('.tab_menu li a');
const conSearch = document.querySelector('.con_search');
const conList = document.querySelector('.con_list');

// Show 'Book Finder' or 'To Read List'
showBtns.forEach((showBtn) => {
    showBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.currentTarget.classList.add('active');
        if(showBtn.classList.contains('show_search')){
            showBtns[1].classList.remove('active');
            conSearch.classList.add('active');
            conList.classList.remove('active');
        }else if(showBtn.classList.contains('show_list')){
            showBtns[0].classList.remove('active');
            conSearch.classList.remove('active');
            conList.classList.add('active');
        };
    });
});



// =============== tab_con ===============
const searchBox = document.querySelector('.search_box input');
const searchBtn = document.querySelector('.search_box .search_btn');
const searchResult = document.querySelector('.search_result ul');

let bookNum = 0;

// If Local Storage has a value, add it to the list
let toReadList = JSON.parse(localStorage.getItem('toreadlist'));
if(toReadList){
    toReadList.forEach((book)=>{
        conList.querySelector('ul').innerHTML += `
            <li class="${book.completed ? 'completed' : ''}">
                <input type="checkbox" id="check${bookNum}" onClick="checkRead(event)" ${book.completed ? 'checked' : ''}>
                <label for="check${bookNum}">${book.bookTitle}</label>
                <button class="delete_btn" onClick="deleteList(event)">Remove</button>
            </li>`;
        bookNum++;
    });

}else{
    toReadList = [];
};


// Search books using Google Books APIs
searchBtn.addEventListener('click', function(){
    const searchValue = searchBox.value;
    if(!searchValue){
        alert('Please enter title or author');
    }else{
        searchBox.value = '';
        searchResult.innerHTML='';

        fetch("https://www.googleapis.com/books/v1/volumes?q=" + searchValue)
        .then(function (response) {
            return response.json();
        })
        .then(function (result) {
            books = result.items;
            books.forEach((book) => {
                let bookImg = '';
                if(book.volumeInfo.imageLinks){
                    bookImg = book.volumeInfo.imageLinks.thumbnail;
                } else{
                    bookImg = './images/no_image.jpg';
                };

                searchResult.innerHTML += `
                    <li>
                        <img src="${bookImg}" alt="book thumbnail">
                        <dl>
                            <dt>${book.volumeInfo.title}</dt>
                            <dd>${book.volumeInfo.authors[0]}</dd>
                            <dd>${book.volumeInfo.publishedDate}</dd>
                            <dd><a href="${book.volumeInfo.infoLink}" target="blank">Learn More</a></dd>
                        </dl>
                        <button onClick="addList(event)">Add</button>
                    </li>`;
            });
        }),
        function (error) {
            console.log(error);
        };
    }
});


// Add a book to the list
function addList(){
    const addBtn = event.target;
    const addTitle = addBtn.previousElementSibling.childNodes[1].textContent;

    if(toReadList.some((book)=> book.bookTitle == addTitle)){
        alert('You already added the book in the list');
    }else{
        conList.querySelector('ul').innerHTML += `
            <li>
                <input type="checkbox" id="check${bookNum}" onClick="checkRead(event)">
                <label for="check${bookNum}">${addTitle}</label>
                <button class="delete_btn" onClick="deleteList(event)">Remove</button>
            </li>`;
        bookNum++;

        toReadList.push({
            bookTitle : addTitle,
            completed : false,
            rating : 0
        });
        updateLocalStorage();
    };
};


// Tick the checkbox if you completed reading
function checkRead(){
    const readCheckbox = event.target;
    const bookLi = readCheckbox.parentElement;
    const checkTitle = bookLi.querySelector('label').textContent;

    if(readCheckbox.checked){
        bookLi.classList.add('completed');
        toReadList.map((book)=>{
            if(book.bookTitle == checkTitle){
                book.completed = true;
            };
        });

    }else{
        bookLi.classList.remove('completed');
        toReadList.map((book)=>{
            if(book.bookTitle == checkTitle){
                book.completed = false;
            };
        });
    };

    updateLocalStorage();
};


// Delete a book from the list
function deleteList(){
    const deleteBtn = event.target;
    const deleteTitle = deleteBtn.previousElementSibling.textContent;

    toReadList = toReadList.filter(book => book.bookTitle != deleteTitle);
    updateLocalStorage();

    deleteBtn.parentElement.remove();
};


// Update Local Storage
function updateLocalStorage(){
    localStorage.setItem('toreadlist', JSON.stringify(toReadList));
};
