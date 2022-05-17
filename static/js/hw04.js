const userInfo2html = user => {
    return `<img src="${user.thumb_url}" alt="Current user's profile picture" width="100" height="100">
            <p id="user-name">${user.username}</p>`;
};

const displayProfile = () => {
    fetch(`/api/profile/`)
    .then(response => response.json())
    .then(data => {
        console.log(data);
        console.log(userInfo2html(data));
        //document.getElementsByClassName('user-profile').innerHtml = userInfo2html(data);
        document.getElementsByClassName('user-profile').innerHtml = `hello world`;
        console.log(document.querySelector('aside header'));
    });
};

const modalElement = document.querySelector('.modal-bg');

const openModal = ev => {
    console.log('open!');
    modalElement.innerHTML = drawModal();
    modalElement.classList.remove('hidden');
    modalElement.setAttribute('aria-hidden', 'false');
    document.querySelector('.close').focus();
}

const closeModal = ev => {
    console.log('close!');
    modalElement.classList.add('hidden');
    modalElement.setAttribute('aria-hidden', 'false');
    //document.querySelector('.open').focus();
};


// function ensures that if the tabbing gets to the end of the 
// modal, it will loop back up to the beginning of the modal:
document.addEventListener('focus', function(event) {
    console.log('focus');
    if (modalElement.getAttribute('aria-hidden') === 'false' && !modalElement.contains(event.target)) {
        console.log('back to top!');
        event.stopPropagation();
        document.querySelector('.close').focus();
    }
}, true);

const drawModal = () => {
    return `<section class="modal">
    <button class="close" aria-label="Close the modal window" onclick="closeModal(event);">Close</button>
    <div class="modal-body">
        <div class="row">
            <p>post username</p> 
            <button class="like-comment">some button</button>
        </div>
         <div class="row">
            <img src="https://picsum.photos/600/430?id=576">
        </div>
    </div>
</section>`
}

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
            elem.setAttribute('aria-checked', 'true')
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
        elem.setAttribute('aria-checked', 'false')
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
                        <button class="follow" 
                        aria-label="Follow"
                        aria-checked="false"
                        data-user-id="${user.id}" 
                        onclick="toggleFollow(event);">follow</button>
                    </div>
                </div>`;
};

const getSuggestions = () => {
    fetch('http://127.0.0.1:5000/api/suggestions/')
        .then(response => response.json())
        .then(users => {
            console.log(users);
            const html = users.map(user2Html).join('\n');
            document.querySelector('#sugg-box').innerHTML = html;
        })
;}

const story2Html = story => {
    return `
        <div>
            <img src="${ story.user.thumb_url }" class="pic" alt="profile pic for ${ story.user.username }" />
            <p>${ story.user.username }</p>
        </div>
    `;
};

// fetch data from your API endpoint:
const displayStories = () => {
    fetch('/api/stories')
        .then(response => response.json())
        .then(stories => {
            const html = stories.map(story2Html).join('\n');
            document.querySelector('.stories').innerHTML = html;
        })
};

// populate the modal with the contents of each post 

// // const modal2html = post => {
//     return `<div class="modal-bg hidden" aria-hidden="true" role="dialog">
//                 <section class="modal">
//                     <button class="close" aria-label="Close the modal window" onclick="closeModal(event);">Close</button>
//                     <div class="modal-body">
//                         <div class="row">
//                             <p>Some comment text</p>
//                             <button class="like-comment">some button</button>
//                         </div>
//                          <div class="row">
//                             <p>Some comment text</p>
//                             <button class="like-comment">some button</button>
//                         </div>
//                         <div class="row">
//                             <p>Some comment text</p>
//                             <button class="like-comment">some button</button>
//                         </div>
//                         <div class="row">
//                             <p>Some comment text</p>
//                             <button class="like-comment">some button</button>
//                         </div>
//                         <div class="row">
//                             <p>Some comment text</p>
//                             <button class="like-comment">some button</button>
//                         </div>
//                     </div>
//                 </section>
//             </div>`;
// // }

const post2Html = post => {
    return `
    <div class="post">
    <div id="post-nav">
        <h4 id="user-name-p">
            ${post.user.username}
        </h4>
        <i class="fas fa-ellipsis-h"></i>
    </div>
    <img src="${post.image_url}" alt="Image used in post ${post.image_url}" width="100%">
    <div id="post-interaction">
        <div id="like-share">
            <button onclick="toggleLike(event)" aria-checked="${post.current_user_like_id ? 'true' : 'false'}" data-post-id="${post.id}" ${post.current_user_like_id ? 'data-likepost-id="'+post.current_user_likepost_id+'"' : ""}><i class="${post.current_user_like_id ? "fas" : "far"} fa-2x fa-heart"></i></button>
            <button><i class="far fa-2x fa-comment"></i></button>
            <i class="far fa-2x fa-paper-plane"></i>
        </div>
        <div id="save">
            <button onclick="toggleBookmark(event)" aria-checked="${post.current_user_bookmark_id ? 'true' : 'false'}" data-post-id="${post.id}" ${post.current_user_bookmark_id ? 'data-bookmark-id="'+post.current_user_bookmark_id+'"' : ""}><i class="${post.current_user_bookmark_id ? "fas" : "far"} fa-2x fa-bookmark"></i></button>
        </div>
    </div>
    <div id="num-likes">
        <p id="numbers">
            ${showCorrectLikes(post.likes.length)}
        </p>
    </div>
    <div class="caption">
        <p>
            <a id="comment-user">
                ${post.user.username}
            </a>
            ${post.caption}
        </p>
    </div>
    ${showCorrectComments(post, post.comments.length)}
    
    <div id="days-ago">
        <p>
            ${post.display_time}
        </p>
    </div>
    <div id="comment-section">
        <div id="left-section">
            <i class="far fa-2x fa-smile"></i>
            <input type="text" id="words" placeholder="Add a comment..."></input>
        </div>
        <button onclick="createComment(event);" id="post-button"> Post </button>
    </div>
    </div>
    `;
}
// document.getElementById('words').value
const displayPost = () => {
    fetch('http://127.0.0.1:5000/api/posts/?limit=10')
        .then(response => response.json())
        .then(post => {
            const html = post.map(post2Html).join('\n');
            document.querySelector('#posts').innerHTML = html;
        })
};


const showCorrectLikes = (numLikes) => {
    if (numLikes == 1) {
        return `${numLikes} like`;
    } else {
        return `${numLikes} likes`;
    }
}

const showCorrectComments = (post, numOfComments) => {
    console.log(post.comments);
    if (numOfComments == 1) {
        return `
            <div class="comment">
                <p>
                    <a id="comment-user">
                        ${post.comments[0].user.username}
                    </a>
                    ${post.comments[0].text}
                </p>
            </div>        
        `;
    } else if (numOfComments > 1) {
        return `
            <div class="comment">
            <p>
                <a id="comment-user">
                    ${post.comments[0].user.username}
                </a>
                ${post.comments[0].text}
            </p>
        </div>
        <button id="view-all" onclick="openModal(event)">
            View all ${numOfComments} comments
        </button>`;
    } else {
        return '';
    }
}

const toggleLike = async(ev) => {
    const elem = ev.currentTarget;
    if (elem.getAttribute('aria-checked') === 'false'){
        // add aria checked 
       createLikePost(elem);
    } else {
        deleteLikePost(elem);
        //elem.innerHTML = `<i class="far fa-2x fa-heart"></i>`
    }
}

const toggleBookmark = ev => {
    const elem = ev.currentTarget;

    if (elem.getAttribute('aria-checked') === 'false') {
        addBookmark(elem.dataset.postId, elem);
    } else {
        removeBookmark(elem.dataset.bookmarkId, elem);
    }
};

const toggleComment = ev => {
    elem = ev.currentTarget;
    // elem.dataset.text
    createComment(elem.dataset.postId, document.getElementById('text').value);
};

// previousElementSibling

const createComment = (postId, text) => {

    const postData = {
        "post_id": postId,
        "text": text
    };
    
    fetch("http://127.0.0.1:5000/api/comments", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(postData)
        })
        .then(response => response.json())
        .then(data => {
            console.log(data);
        });
};

const addBookmark = (postId, elem) => {

    const postData = {
        "post_id": postId
    };

    fetch("http://127.0.0.1:5000/api/bookmarks/", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData)
    })
    .then(response => response.json())
    .then(data => {
        console.log(data);
        elem.setAttribute('aria-checked', 'true');
        elem.setAttribute('data-bookmark-id', data.id);
        elem.innerHTML = `<i class="fas fa-2x fa-bookmark"></i>`
    });

}; 

const removeBookmark = (bookmarkId, elem) => {
    deleteURL = `http://127.0.0.1:5000/api/bookmarks/${bookmarkId}`
    fetch(deleteURL, {
        method: "DELETE"
    })
    .then(response => response.json())
    .then(data => {
        console.log(data);
        elem.setAttribute('aria-checked', 'false');
        elem.removeAttribute('data-bookmark-id');
        elem.innerHTML = `<i class="far fa-2x fa-bookmark"></i>`
    });
}

const createLikePost = elem => {
    const post_id = Number(elem.dataset.postId);

    const postData = {
        "post_id": post_id
    };
    
    fetch(`http://127.0.0.1:5000/api/posts/likes/`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(postData)
        })
        .then(response => response.json())
        .then(data => {
            console.log(data);
            elem.setAttribute("aria-checked", 'true');
            elem.setAttribute("data-likepost-id", data.id);
            elem.innerHTML = `<i class="fas fa-2x fa-heart"></i>`
        });
}

const deleteLikePost = elem => {
    console.log(elem.dataset)
    const like_id = elem.dataset.likepostId;
    console.log(like_id)

    fetch(`http://127.0.0.1:5000/api/posts/likes/${like_id}`, {
        method: "DELETE",
        headers: {
            'Content-Type': 'application/json',
        }
    })
    .then(response => response.json())
    .then(data => {
        console.log(data);
        elem.setAttribute("aria-checked", 'false');
        elem.removeAttribute("data-likepost-id", data.id);
        elem.innerHTML = `<i class="far fa-2x fa-heart"></i>`
    });

};


const initPage = () => {
    displayStories();
    displayPost();
    getSuggestions();
    displayProfile();
};

initPage();
displayProfile();
