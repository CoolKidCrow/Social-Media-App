const { Client } = require('pg');

const fs = require('fs');
const e = require('express');
const { resourceLimits } = require('worker_threads');

const passwd = fs.readFileSync('credentials.txt', 'utf8')

const client = new Client({
    host: 'localhost',
    user: 'postgres',
    port: 5432,
    password: passwd,
    database: 'postgres'
});

client.connect();

async function CreateUser(user) {
    try {
        let checkEmail = await FetchUserByEmail(user.email);
        if(checkEmail != null) {
            return "Email already registered"
        }
        const query = 'INSERT INTO users (gender, hometown, dob, fName, lName, email, hashPass) VALUES ($1,$2,$3,$4,$5,$6,$7)';
        await client.query(query, [user.gender, user.hometown, user.dob, user.fname, user.lname, user.email, user.hashPass]);
    } catch (err) {
        console.log(err.message);
    }
}

async function FetchUserByEmail(email) {
    try{
        const query = 'SELECT * FROM users WHERE email = $1';
        let user = await client.query(query, [email]);
        return user.rows[0];
    } catch (err){
        console.log(err.stack);
    }
}

async function FetchUserByUID(uid) {
    try{
        const query = 'SELECT * FROM users WHERE UID = $1';
        let user = await client.query(query, [uid]);
        return user.rows[0];
    } catch (err){
        console.log(err.stack);
    }
}

async function CreateFriendship(uid, fid)
{
    try {
        const query = 'INSERT INTO Friends (UID, FID) VALUES ($1,$2)';
        await client.query(query, [uid, fid]);
    } catch (err) {
        console.log(err.message);
    }
}

async function FetchUserByName(name, uid)
{
    try{
        const query = "SELECT * FROM Users WHERE fname LIKE $1 AND uid != $2 ";
        let user = await client.query(query, [`${name}%`, uid]);
        return user.rows;
    } catch (err){
        console.log(err.stack);
    }
}

async function UpdateAccountInfo(user)
{
    try {
        const query = 'UPDATE Users SET gender = $1, hometown = $2, dob = $3, fname = $4, lname = $5 WHERE UID = $6';
        await client.query(query, [user.gender, user.hometown, user.dob, user.fname, user.lname, user.uid]);
    } catch (err) {
        console.log(err.message);
    }
}

async function FetchFriendsOfUserByUID(uid)
{
    try{
        const query = "SELECT fid, fname, lname FROM Friends INNER JOIN Users ON Friends.FID = Users.UID WHERE friends.uid = $1";
        const result = await client.query(query, [uid]);
        return result.rows;
    } catch (err){
        console.log(err.stack);
    }
}

async function CreateAlbum(uid, name)
{
    try {
        const query = 'INSERT INTO Albums (uid, albumName) VALUES ($1, $2)';
        await client.query(query, [uid, name]);
    } catch (err) {
        console.log(err.message);
    }
}

async function FetchAlbumsOfUserByUID(uid)
{
    try{
        const query = "SELECT aid, albumName FROM Albums WHERE uid = $1";
        const result = await client.query(query, [uid]);
        return result.rows;
    } catch (err){
        console.log(err.stack);
    }
}

async function FetchPhotosByAID(aid)
{
    try{
        const query = "SELECT * FROM Photos WHERE aid = $1 ORDER BY date DESC";
        const result = await client.query(query, [aid]);
        return result.rows;
    } catch (err){
        console.log(err.stack);
    }
}

async function CreatePhoto(aid, caption, photourl)
{
    try{
        const query = "INSERT INTO Photos (AID, caption, photoUrl) VALUES ($1, $2, $3)";
        const result = await client.query(query, [aid, caption, photourl]);
    } catch (err){
        console.log(err.stack);
    }
}

async function FetchPhotoByPID(pid)
{
    try{
        const query = "SELECT * FROM Photos INNER JOIN Albums ON Photos.aid = Albums.aid INNER JOIN Users on Albums.uid = Users.uid WHERE pid = $1";
        const result = await client.query(query, [pid]);
        return result.rows[0];
    } catch (err){
        console.log(err.stack);
    }
}

async function FetchAlbumByAid(aid)
{
    try{
        const query = "SELECT * FROM albums WHERE aid = $1";
        const result = await client.query(query, [aid]);
        return result.rows[0];
    } catch (err){
        console.log(err.stack);
    }
}

async function FetchAllPhotos()
{
    try{
        const query = "SELECT photourl, fname, lname, users.uid, pid, caption FROM photos INNER JOIN albums ON albums.aid = photos.aid INNER JOIN users ON albums.uid = users.uid ORDER BY photos.date DESC";
        const result = await client.query(query);
        return result.rows;
    } catch (err){
        console.log(err.stack);
    }
}

async function DeleteAlbumByAID(aid)
{
    try{
        const query = "DELETE FROM albums WHERE aid = $1;";
        await client.query(query, [aid]);
    } catch (err){
        console.log(err.stack);
    }
}

async function DeletePhotoByPID(pid)
{
    try{
        const query = "DELETE FROM photos WHERE pid = $1;";
        await client.query(query, [pid]);
    } catch (err){
        console.log(err.stack);
    }
}

async function CreateComment(pid, uid, text)
{
    try{
        const query = "INSERT INTO Comments (PID, UID, text) VALUES ($1, $2, $3)";
        const result = await client.query(query, [pid, uid, text]);
    } catch (err){
        console.log(err.stack);
    }
}

async function FetchCommentsByPID(pid)
{
    try{
        const query = "SELECT date, fname, lname, text FROM Comments INNER JOIN Users on Comments.UID = Users.UID WHERE pid = $1";
        const result = await client.query(query, [pid]);
        return result.rows;
    } catch (err){
        console.log(err.stack);
    }
}

async function FetchTagsByPID(pid)
{
    try{
        const query = "SELECT * FROM Tags WHERE pid = $1";
        const result = await client.query(query, [pid]);
        return result.rows;
    } catch (err){
        console.log(err.stack);
    }
}

async function CreateTag(text, pid)
{
    try{
        const query = "INSERT INTO Tags (text, pid) VALUES ($1, $2)";
        const result = await client.query(query, [text, pid]);
    } catch (err){
        console.log(err.stack);
    }
}

async function FetchPhotosByTagText(text)
{
    try{
        const query = "SELECT fname, lname, albums.uid, photourl, caption, photos.pid FROM Tags INNER JOIN Photos ON Tags.pid = Photos.pid INNER JOIN Albums ON photos.aid = albums.aid INNER JOIN Users ON users.uid = albums.uid WHERE text = $1";
        const result = await client.query(query, [text]);
        return result.rows;
    } catch (err){
        console.log(err.stack);
    }
}

async function FetchPhotosByTagTextAndUID(text, uid)
{
    try{
        const query = "SELECT fname, lname, albums.uid, photourl, caption, photos.pid FROM Tags INNER JOIN Photos ON Tags.pid = Photos.pid INNER JOIN Albums ON photos.aid = albums.aid INNER JOIN Users ON users.uid = albums.uid WHERE text = $1 AND users.uid = $2";
        const result = await client.query(query, [text, uid]);
        return result.rows;
    } catch (err){
        console.log(err.stack);
    }
}

async function FetchLikesByPID(pid)
{
    try{
        const query = "SELECT fname, lname, users.uid FROM Likes INNER JOIN users ON likes.uid = users.uid WHERE pid = $1";
        const result = await client.query(query, [pid]);
        return result.rows;
    } catch (err){
        console.log(err.stack);
    }
}

async function CreateLike(uid, pid)
{
    try{
        const query = "INSERT INTO Likes (uid, pid) VALUES ($1, $2)";
        const result = await client.query(query, [uid, pid]);
    } catch (err){
        console.log(err.stack);
    }
}

async function FetchPopularTags()
{
    try{
        const query = "SELECT t.text, COUNT(*) as tag_count FROM Tags t JOIN photos p ON t.pid = p.pid GROUP BY t.text ORDER BY COUNT(*) DESC";
        const result = await client.query(query);
        return result.rows;
    } catch (err){
        console.log(err.stack);
    }
}

async function FetchTopContributers()
{
    try{
        var query = "SELECT COALESCE(pCount.uid, cCount.uid) as UID, COALESCE(pCount.count, 0) + COALESCE(cCount.count,0) as Contribution, COALESCE(pCount.fname, cCount.fname) as fname, COALESCE(pCount.lname, cCount.lname) as lname "
        query += "FROM (SELECT a.uid, COUNT(a.uid), u.fname, u.lname FROM Albums a "
        query += "JOIN Photos p ON a.aid = p.aid "
        query += "INNER JOIN Users u ON u.uid = a.uid "
        query += "GROUP BY a.uid, u.fname, u.lname) as pCount "
        query += "FULL JOIN (SELECT c.uid, COUNT(c.uid), u.fname, u.lname "
        query += "FROM Comments c "
        query += "INNER JOIN Users u ON u.uid = c.uid "
        query += "GROUP BY c.uid, u.fname, u.lname) as cCount ON pCount.uid = cCount.uid "
        query += "ORDER BY Contribution DESC"
        const result = await client.query(query);
        return result.rows;
    } catch (err){
        console.log(err.stack);
    }
}

async function FetchPhotosByTags(tags)
{
    var inClause = "";
    tags.forEach(tag => {
        inClause += `'${tag}', `
    });
    inClause = inClause.trimEnd();
    inClause = inClause.slice(0, inClause.length - 1)

    try{
        var query = "SELECT tags.pid, photos.pid, photos.caption, photos.photourl, users.uid, users.fname, users.lname FROM Tags "
            query += "INNER JOIN Photos ON Tags.pid = photos.pid "
            query += "INNER JOIN Albums ON Photos.aid = Albums.aid "
            query += "INNER JOIN Users On Users.uid = Albums.uid "
            query += `WHERE text IN (${inClause}) `
            query += "GROUP BY tags.pid, photos.pid, photos.caption, photos.photourl, users.uid, users.fname, users.lname "
            query += `HAVING COUNT(DISTINCT text) = ${tags.length}`
        const result = await client.query(query);
        return result.rows;
    } catch (err){
        console.log(err.stack);
    }
}

async function FetchPhotosByTagsAndUID(tags, uid)
{
    var inClause = "";
    tags.forEach(tag => {
        inClause += `'${tag}', `
    });
    inClause = inClause.trimEnd();
    inClause = inClause.slice(0, inClause.length - 1)

    try{
        var query = "SELECT tags.pid, photos.pid, photos.caption, photos.photourl, users.uid, users.fname, users.lname FROM Tags "
            query += "INNER JOIN Photos ON Tags.pid = photos.pid "
            query += "INNER JOIN Albums ON Photos.aid = Albums.aid "
            query += "INNER JOIN Users On Users.uid = Albums.uid "
            query += `WHERE users.uid = ${uid} AND text IN (${inClause}) `
            query += "GROUP BY tags.pid, photos.pid, photos.caption, photos.photourl, users.uid, users.fname, users.lname "
            query += `HAVING COUNT(DISTINCT text) = ${tags.length}`
        const result = await client.query(query);
        return result.rows;
    } catch (err){
        console.log(err.stack);
    }
}

async function FetchRecommendedFriends(uid)
{
    try{
        let query = "SELECT users.uid, users.fname, users.lname, count(f1.fid) " +
        "FROM Friends f1 " +
        "JOIN (SELECT fid " +
        "FROM Friends " +
        `WHERE uid = ${uid}) as f2 ON f1.uid = f2.fid ` +
        "INNER JOIN Users " +
        "ON f1.fid = Users.uid " +
        "GROUP BY f1.fid, users.uid, users.fname, users.lname " +
        "ORDER BY count(f1.fid) DESC"
        const result = await client.query(query);
        return result.rows;
    } catch (err){
        console.log(err.stack);
    }
}

async function FetchUserCommentsThatMatchText(text)
{
    try{
        const query = "SELECT u.fname, u.lname, u.uid, COUNT(*) AS num_matches " +
        "FROM users u " +
        "INNER JOIN comments c ON u.uid = c.uid " +
        `WHERE c.text = '${text}' `+
        "GROUP BY u.uid " +
        "ORDER BY num_matches DESC"
        const result = await client.query(query);
        return result.rows;
    } catch (err){
        console.log(err.stack);
    }
}

async function FetchYouMayAlsoLikePhotos(uid)
{
    try{
        const tags = await FetchTopFiveUserTags(uid)
        
        let tag1 = (tags.length >= 1) ? tags[0].text : ''
        let tag2 = (tags.length >= 2) ? tags[1].text : ''
        let tag3 = (tags.length >= 3) ? tags[2].text : ''
        let tag4 = (tags.length >= 4) ? tags[3].text : ''
        let tag5 = (tags.length >= 5) ? tags[4].text : ''

        const query = `SELECT t.pid, u.fname, u.lname, u.uid, p.photourl, p.caption, p.pid, COUNT(CASE WHEN t.text='a' AND t.pid=p.pid THEN 1 ELSE NULL END) + ` +
            `COUNT(CASE WHEN t.text='${tag2}' AND t.pid=p.pid THEN 1 ELSE NULL END) + ` +
            `COUNT(CASE WHEN t.text='${tag3}' AND t.pid=p.pid THEN 1 ELSE NULL END) + ` +
            `COUNT(CASE WHEN t.text='${tag4}' AND t.pid=p.pid THEN 1 ELSE NULL END) + ` +
            `COUNT(CASE WHEN t.text='${tag5}' AND t.pid=p.pid THEN 1 ELSE NULL END) AS fulfilled_conditions ` +
        "FROM Tags t " +
        "JOIN Photos p on t.pid = p.pid " +
        "INNER JOIN Albums a ON p.aid = a.aid " +
        "INNER JOIN Users u ON a.uid = u.uid " +
        `WHERE (t.text='${tag1}' AND t.pid=p.pid) ` +
            `OR (t.text='${tag2}' AND t.pid=p.pid) ` +
            `OR (t.text='${tag3}' AND t.pid=p.pid) ` +
            `OR (t.text='${tag4}' AND t.pid=p.pid) ` +
            `OR (t.text='${tag5}' AND t.pid=p.pid) ` +
        "GROUP BY t.pid, u.fname, u.lname, u.uid, p.photourl, p.caption, p.pid " +
        "ORDER BY p.date DESC"

        const result = await client.query(query);
        return result.rows;
    } catch (err){
        console.log(err.stack);
    }
}

async function FetchTopFiveUserTags(uid)
{
    try{
        const query = "SELECT tags.text, COUNT(*) AS tag_count " +
        "FROM Tags " +
        "INNER JOIN Photos ON Tags.pid = photos.pid " +
        "INNER JOIN Albums ON photos.aid = albums.aid " +
        "INNER JOIN Users on albums.uid = users.uid " +
        "WHERE users.uid = $1 " +
        "GROUP BY tags.text " +
        "ORDER BY tag_count DESC " +
        "LIMIT 5"
        const result = await client.query(query, [uid]);
        return result.rows;
    } catch (err){
        console.log(err.stack);
    }
}

module.exports = { CreateUser, 
    FetchUserByEmail, 
    FetchUserByUID, 
    CreateFriendship, 
    FetchUserByName, 
    UpdateAccountInfo, 
    FetchFriendsOfUserByUID, 
    CreateAlbum, 
    FetchAlbumsOfUserByUID,
    FetchPhotosByAID,
    CreatePhoto,
    FetchPhotoByPID,
    FetchAlbumByAid,
    FetchAllPhotos,
    DeleteAlbumByAID,
    DeletePhotoByPID,
    CreateComment,
    FetchCommentsByPID,
    FetchTagsByPID,
    CreateTag,
    FetchPhotosByTagText,
    FetchPhotosByTagTextAndUID,
    FetchLikesByPID,
    CreateLike,
    FetchPopularTags,
    FetchTopContributers,
    FetchPhotosByTags,
    FetchPhotosByTagsAndUID,
    FetchRecommendedFriends,
    FetchUserCommentsThatMatchText,
    FetchYouMayAlsoLikePhotos }