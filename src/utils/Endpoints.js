const BASE_URL = 'http://localhost:8080/api';

const endpoints = {
    auth: {
        login: `${BASE_URL}/auth/login`,
        register: `${BASE_URL}/auth/register`
    },
    posts: {
        getAll: (page, size) => `${BASE_URL}/posts?page=${page - 1}&size=${size}`,
        create: `${BASE_URL}/posts`,
        getByUniqueNum: (uniqueNum) => `${BASE_URL}/posts/${uniqueNum}`,
        editByUniqueNum: (uniqueNum) => `${BASE_URL}/posts/${uniqueNum}`,
        deleteByUniqueNum: (uniqueNum) => `${BASE_URL}/posts/${uniqueNum}`
    },
    comments: {
        getAllByPostUniqueNum: (postUniqueNum, page, size) => `${BASE_URL}/comments/post/${postUniqueNum}?page=${page - 1}&size=${size}`,
        createByPostUniqueNum: (postUniqueNum) => `${BASE_URL}/comments/post/${postUniqueNum}`,
        editByCommentUniqueNum: (commentUniqueNum) => `${BASE_URL}/comments/${commentUniqueNum}`,
        deleteByCommentUniqueNum: (commentUniqueNum) => `${BASE_URL}/comments/${commentUniqueNum}`
    },
    users: {
        getByUsername: (username)=>`${BASE_URL}/users/${username}`,
        editByUsername: (username)=>`${BASE_URL}/users/${username}`,
        changePasswordByUsername: (username)=>`${BASE_URL}/users/${username}/password`,
    }
};

export default endpoints;