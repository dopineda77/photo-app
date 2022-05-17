const toggleFollow = ev => {
    console.log(ev);
    const elem = ev.currentTarget;
    console.log(elem.dataset);
    console.log(elem.dataset.userId);
    console.log(elem.innerHTML);

    if (elem.innerHTML === 'follow') {
        createFollower(elem.dataset.userId, elem);
    } else {
        deleteFollower(elem.dataset.followingId, elem)
    }
}

const createFollower = (userId, elem) => {

    const postData = {
        "user_id": userId
    };
    
    fetch("http://127.0.0.1:5000/api/following/", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(postData)
        })
        .then(response => response.json())
        .then(data => {
            console.log(data);
            elem.innerHTML = 'unfollow';
            elem.classList.add('unfollow');
            elem.classList.remove('follow');
            elem.setAttribute('data-following-id', data.id);
        });

};

const deleteFollower = (followingId, elem) => {
    fetch(`http://127.0.0.1:5000/api/following/${followingId}`, {
        method: "DELETE",
        headers: {
            'Content-Type': 'application/json',
        }
    })
    .then(response => response.json())
    .then(data => {
        console.log(data);
        elem.innerHTML = 'follow';
        elem.classList.remove('unfollow');
        elem.classList.add('follow');
        elem.removeAttribute('data-following-id');
    });
};

const user2Html = user => {
    return `<div class="suggestion">
                    <img src="${user.thumb_url}" />
                    <div>
                        <p class="username">${user.username}</p>
                        <p class="suggestion-text">suggested for you</p>
                    </div>
                    <div>
                        <button class="follow" data-user-id="${user.id}" onclick="toggleFollow(event);">follow</button>
                    </div>
                </div>`;

};

const getSuggestions = () => {
    fetch('http://127.0.0.1:5000/api/suggestions/')
        .then(response => response.json())
        .then(users => {
            console.log(users);
            const html = users.map(user2Html).join('\n');
            document.querySelector('#suggestions').innerHTML = html;
        })
;}

getSuggestions();