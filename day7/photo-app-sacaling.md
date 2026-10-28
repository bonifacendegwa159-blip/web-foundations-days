# SnapShare Photo App Scaling Plan

## 1. Overview

SnapShare is a photo-sharing application where users upload photos and view feeds containing photos from people they follow.

This document estimates the application's expected workload and describes an architecture designed to handle photo uploads, feed requests, image storage, and thumbnail processing.

## 2. Assumptions

The following assumptions are used for this scaling plan:

* SnapShare has 10 million registered users.
* 10% of registered users are active each day.
* Each daily active user uploads one photo per day.
* Each daily active user views 50 feed pages per day.
* The average original photo size is 2 MB.
* Each photo also has one thumbnail averaging 50 KB.
* A day contains 86,400 seconds.
* A year contains 365 days.
* Storage calculations use decimal units: 1 KB = 1,000 bytes, 1 MB = 1,000 KB, 1 GB = 1,000 MB, and 1 TB = 1,000 GB.
* Peak traffic is estimated at five times the average traffic.
* All uploaded photos and their thumbnails are retained for the year.
* Each original photo and thumbnail is stored once; backups and additional replicas are excluded from the storage estimate.
* Traffic is assumed to be spread across the day for average-rate calculations, although actual traffic will vary.

### Daily active users

Daily active users = Registered users × Daily active percentage

= 10,000,000 × 10%

= **1,000,000 daily active users**

## 3. Traffic and Storage Estimates

### 3.1 Photo uploads

Daily uploads = Daily active users × Photos uploaded per user per day

= 1,000,000 × 1

= **1,000,000 photo uploads per day**

Average uploads per second:

= 1,000,000 ÷ 86,400

= **11.57 uploads per second**

Peak uploads per second:

= 11.57 × 5

= **57.87 uploads per second**

Therefore, the estimated average upload rate is approximately 12 uploads per second, with an estimated peak of 58 uploads per second.

### 3.2 Feed views

Daily feed views = Daily active users × Feed pages viewed per user per day

= 1,000,000 × 50

= **50,000,000 feed page views per day**

Average feed views per second:

= 50,000,000 ÷ 86,400

= **578.70 feed views per second**

Peak feed views per second:

= 578.70 × 5

= **2,893.52 feed views per second**

Therefore, the estimated average feed-view rate is approximately 579 requests per second, with an estimated peak of 2,894 requests per second.

### 3.3 Photo storage

Each original photo averages 2 MB.

Daily original photo storage:

= 1,000,000 × 2 MB

= 2,000,000 MB

= **2 TB per day**

Each thumbnail averages 50 KB, or 0.05 MB.

Daily thumbnail storage:

= 1,000,000 × 0.05 MB

= 50,000 MB

= **50 GB per day**

Total daily photo storage:

= 2,000 GB + 50 GB

= **2.05 TB per day**

Annual original photo storage:

= 2 TB × 365

= **730 TB per year**

Annual thumbnail storage:

= 50 GB × 365

= 18,250 GB

= **18.25 TB per year**

Total annual photo storage:

= 730 TB + 18.25 TB

= **748.25 TB per year**

This estimate includes original photos and thumbnails but excludes database records, backups, replication overhead, and other storage requirements.

### 3.4 Summary table

| Metric                        | Average or Total |
| ----------------------------- | ---------------: |
| Registered users              |       10,000,000 |
| Daily active users            |        1,000,000 |
| Daily photo uploads           |        1,000,000 |
| Average uploads per second    |            11.57 |
| Peak uploads per second       |            57.87 |
| Daily feed views              |       50,000,000 |
| Average feed views per second |           578.70 |
| Peak feed views per second    |         2,893.52 |
| Daily original photo storage  |             2 TB |
| Daily thumbnail storage       |            50 GB |
| Total daily photo storage     |          2.05 TB |
| Annual original photo storage |           730 TB |
| Annual thumbnail storage      |         18.25 TB |
| Total annual photo storage    |        748.25 TB |

## 4. Read-Heavy or Write-Heavy?

SnapShare is a **read-heavy system** because users view feed pages much more frequently than they upload photos.

The estimated average traffic is approximately 579 feed views per second compared with 11.57 photo uploads per second. This is roughly 50 feed views for every photo upload.

A read-heavy design should prioritize fast retrieval of feed information and images.

The architecture uses a CDN to serve cached images, a cache to reduce repeated database queries, and a database read replica to distribute read workloads. Object storage holds image files, while a queue and background worker handle thumbnail generation without blocking the upload process.

## 5. Why Photos Should Not Be Stored Inside the Database

The database should store structured information such as user IDs, photo IDs, captions, timestamps, ownership information, and object-storage keys.

The actual photo files should be stored in object storage.

Storing large image files directly in the database would substantially increase its storage requirements and could make database backups, maintenance, and scaling more expensive.

Object storage is designed to store large numbers of files and can scale independently from the database. A CDN can also cache and deliver these files efficiently without sending every image request through the application servers.

Examples of object-storage services include Amazon S3, Azure Blob Storage, and Google Cloud Storage.

For example, the database might store:

* Photo ID: `photo_1001`
* User ID: `user_25`
* Caption: `A beautiful sunset`
* Storage key: `photos/2026/10/photo_1001.jpg`

The actual image is stored at the corresponding object-storage key.

## 6. Architecture Diagram

```text
                         SNAPSHARE ARCHITECTURE

                               USERS
                                 |
                                 v
                         +---------------+
                         |     CDN       |
                         | Cached Photos |
                         +---------------+
                                 |
                                 v
                         +---------------+
                         | Load Balancer |
                         +---------------+
                                 |
                                 v
                         +---------------+
                         |  App Servers  |
                         +---------------+
                           |     |     |
              +------------+     |     +----------------+
              |                  |                      |
              v                  v                      v
       +-------------+   +---------------+      +----------------+
       |    Cache    |   | Primary DB    |      | Object Storage  |
       |             |   | Writes/Reads  |      | Original Photos|
       +-------------+   +---------------+      | + Thumbnails   |
                                |               +----------------+
                                v                       ^
                         +---------------+              |
                         |  Read Replica |              |
                         |  Read Queries |              |
                         +---------------+              |
                                                        |
                         +---------------+              |
                         |    Queue      |              |
                         | Thumbnail Job |              |
                         +---------------+              |
                                |                       |
                                v                       |
                         +---------------+              |
                         |   Thumbnail   |--------------+
                         |    Worker     |
                         +---------------+
```

The diagram represents the main logical components; a production deployment would distinguish dynamic API requests from image-delivery requests through the CDN.

## 7. Component Responsibilities

1. **CDN:** The CDN caches and delivers photos close to users, reducing image-loading latency and traffic to origin storage.

2. **Load balancer:** The load balancer distributes incoming application requests across multiple app servers so that one server does not handle all the traffic.

3. **App servers:** App servers execute application logic and handle requests such as authentication, photo uploads, and feed generation.

4. **Cache:** The cache stores frequently requested data in fast memory to reduce repeated database queries and improve response times.

5. **Primary database:** The primary database stores structured application information and handles writes to users, photo metadata, captions, and following relationships.

6. **Database read replica:** The read replica serves eligible read queries using replicated data, reducing the read workload on the primary database.

7. **Object storage:** Object storage holds the original photo files and generated thumbnails without placing large image files directly inside the database.

8. **Queue:** The queue stores thumbnail-generation jobs so that image processing can happen asynchronously instead of delaying the upload response.

9. **Thumbnail worker:** The thumbnail worker retrieves queued jobs, creates smaller versions of uploaded photos, and saves the thumbnails to object storage.

## 8. Photo Upload Flow

1. **User selects a photo:** The user selects a photo in the SnapShare application, and the application checks basic file requirements.

2. **Upload request is sent:** The application sends the upload request through the load balancer to an app server, which authenticates the user and validates the request.

3. **Original photo is stored:** The original image is saved in object storage. Alternatively, the application can authorize a direct upload to object storage using a short-lived, restricted upload URL.

4. **Photo metadata is saved:** The application writes the photo ID, user ID, caption, storage key, and timestamp to the primary database.

5. **Thumbnail job is queued:** The application publishes a thumbnail-generation job to the queue.

6. **Worker retrieves the job:** A background worker reads the job from the queue and retrieves the original image from object storage.

7. **Thumbnail is generated:** The worker resizes and compresses the original image to create a smaller thumbnail.

8. **Thumbnail is stored:** The worker saves the thumbnail in object storage and makes its storage key available to the application.

9. **Photo becomes available:** The application includes the photo in the appropriate feed once the necessary metadata is available, handling any delay in thumbnail generation.

10. **CDN delivers the image:** When users view the feed, their clients request thumbnails through the CDN, which serves cached images or fetches missing images from origin storage.

The upload and thumbnail-generation processes should include retries and failure handling. Because object storage, the database, and the queue are separate systems, the application must also handle partial failures and prevent or clean up orphaned files.

## 9. Trade-Offs

### 9.1 Caching versus fresh data

**Benefit:** Caching improves response times and reduces database queries.

**Disadvantage:** Cached data may become outdated after a profile update, photo deletion, or change in following relationships.

**Mitigation:** Use cache expiration, invalidation, and suitable consistency rules for data that must remain fresh.

### 9.2 Asynchronous thumbnail generation versus immediate availability

**Benefit:** Background processing allows photo uploads to finish without waiting for thumbnail generation.

**Disadvantage:** A thumbnail may not be available immediately after the original photo is uploaded.

**Mitigation:** Display a placeholder until the thumbnail is ready and retry failed jobs.

### 9.3 Read replicas versus immediate consistency

**Benefit:** Read replicas distribute database read queries and reduce pressure on the primary database.

**Disadvantage:** Replication lag can cause a recent upload or update to be temporarily missing from replica-based queries.

**Mitigation:** Route consistency-sensitive reads to the primary database and allow brief delays for less critical feed reads.

### 9.4 Object storage versus simpler file management

**Benefit:** Object storage scales independently from the database and efficiently stores large numbers of images.

**Disadvantage:** The application must manage storage keys, permissions, image URLs, and consistency between image files and database records.

**Mitigation:** Use consistent storage-key conventions, access controls, monitoring, and cleanup jobs for orphaned files.

## 10. Conclusion

SnapShare is expected to support one million daily active users, approximately one million daily photo uploads, and 50 million daily feed views.

The estimated peak traffic is about 58 photo uploads per second and 2,894 feed views per second.

Original photos and thumbnails are expected to consume approximately 748.25 TB of new storage per year using decimal units.

Because SnapShare is read-heavy, the architecture prioritizes efficient image delivery and feed retrieval through a CDN, cache, and database read replica. Object storage keeps large image files separate from structured database records, while a queue and background worker handle thumbnail generation asynchronously.

This design provides a foundation for scaling SnapShare while acknowledging trade-offs involving caching, consistency, asynchronous processing, and storage management.

