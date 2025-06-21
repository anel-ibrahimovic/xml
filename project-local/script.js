const books = []; 

function fetchBooksFromGitHubAPI() {
  const apiUrl = 'https://api.github.com/repos/anel-ibrahimovic/xml/contents/eBooks';

  fetch(apiUrl)
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to fetch data from GitHub API');
      }
      return response.json();
    })
    .then(data => {
      const fileContent = atob(data.content); 

      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(fileContent, "application/xml");

      const parseError = xmlDoc.querySelector("parsererror");
      if (parseError) {
        alert("XML parsing error.");
        console.error(parseError);
        return;
      }

      const bookElements = xmlDoc.getElementsByTagName("book");

      for (let book of bookElements) {
        const id = book.getAttribute("id") || crypto.randomUUID();
        const author = book.querySelector("author")?.textContent || "Author Unavailable";
        const title = book.querySelector("title")?.textContent || "Title Unavailable";
        const genre = book.querySelector("genre")?.textContent || "Genre Unavailable";
        const publishDate = book.querySelector("publish_date")?.textContent || "Publish Date Unavailable";
        const description = book.querySelector("description")?.textContent || "Description Unavailable";
        const price = book.querySelector("price")?.textContent || "Price Unavailable";

        // Dohvati status iz localStorage ako postoji
        const savedStatus = localStorage.getItem(`bookStatus_${id}`);

        books.push({
          id,
          author,
          title,
          genre,
          publishDate,
          description,
          price,
          status: savedStatus || "available"
        });
      }

      if (books.length === 0) {
        alert("No Books");
      } else {
        loadBooks();
        alert(`${books.length} books loaded from GitHub API.`);
      }
    })
    .catch(err => {
      alert("Error Fetching from GitHub API: " + err);
      console.error(err);
    });
}

function loadBooks() {
  const container = document.getElementById("bookList");
  container.innerHTML = "";

  if (books.length === 0) {
    container.innerHTML = "<p>No Books Available.</p>";
    return;
  }

  books.forEach(book => {
    container.innerHTML += `
      <div class="book">
        <img src="eBook.png" alt="${book.title}" class="book-img"><br>
        <div class="book-info">
          ${book.author}
          <p><strong>${book.title}</strong></p><br>
          <b>Genre:</b> ${book.genre}<br>
          <b>Published:</b> ${book.publishDate}<br>
          <b>Description:</b> ${book.description}<br>
          <b>Price:</b> ${book.price}<br>
          <b>Status:</b> ${book.status}<br><br>
          <button onclick="updateStatus('${book.id}', 'unavailable')">Buy</button>
          <button onclick="updateStatus('${book.id}', 'available')">Return</button>
        </div>
      </div>
    `;
  });
}

function updateStatus(id, newStatus) {
  const book = books.find(b => b.id === id);
  if (book) {
    book.status = newStatus;
    localStorage.setItem(`bookStatus_${id}`, newStatus);
    loadBooks(); 
  }
}

window.onload = function () {
  fetchBooksFromGitHubAPI();
};
