# Book reviews

```sh
cd final_project
npm install
npm start
```

Runs on port 5000 by default. Set `PORT` to change it.

GET routes:
- `/`
- `/isbn/:isbn`
- `/author/:author`
- `/title/:title`
- `/review/:isbn`

Register with `POST /register` and log in with `POST /customer/login`.
Both accept JSON with `username` and `password`.

After logging in, use `PUT /customer/auth/review/:isbn` with a JSON `review`
field to add or update your review. Use `DELETE /customer/auth/review/:isbn`
to remove it. Send the session cookie with both requests.

Users and reviews are stored in memory and reset on restart.

`npm run examples` runs the Axios retrieval functions. Set `BOOKSTORE_URL`
if the server is running at a different address.
