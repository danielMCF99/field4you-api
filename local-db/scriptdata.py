from pymongo import MongoClient, errors
from faker import Faker
from bson import ObjectId
import random
import datetime
import bcrypt
import time

fake = Faker('pt_PT')
client = MongoClient("mongodb://admin:password@mongodb:27017/?authSource=admin&replicaSet=rs0&directConnection=true")

def wait_for_replica_set_ready(client, retries=30, delay=10):
    for attempt in range(retries):
        try:
            status = client.admin.command("replSetGetStatus")
            if status["ok"] == 1:
                print("Replica set está pronto.")
                return
        except errors.PyMongoError as e:
            print(f"Tentativa {attempt + 1}: Replica set não está pronto. Erro: {e}")
        time.sleep(delay)
    raise Exception("Timeout à espera do replica set estar pronto.")

wait_for_replica_set_ready(client)

auth_db = client["auth-microservice"]
user_db = client["user-microservice"]
sports_venue_db = client["sports-venue-microservice"]
booking_db = client["booking-microservice"]
feed_db = client["feed-microservice"]

auth_col = auth_db["Auth"]
login_history_col = auth_db["LoginHistory"]
user_col = user_db["Users"]
owner_request_col = user_db["OwnerRequests"]
sports_venue_col = sports_venue_db["SportsVenues"]
sports_venue_booking_invites_col = sports_venue_db["BookingInvites"]
booking_col = booking_db["Bookings"]
booking_invite_col = booking_db["BookingInvites"]
booking_users_col = booking_db["Users"]
booking_sports_venues_col = booking_db["SportsVenues"]
posts_col = feed_db["posts"]

def hash_password(password):
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode()

now = datetime.datetime.utcnow()

admin = {
    "userType": "Admin",
    "email": "admin123@alunos.ipca.pt",
    "password": hash_password("admin123"),
    "status": "Active",
    "registerDate": now,
    "lastAccessDate": now,
    "createdAt": now,
    "updatedAt": now,
    "__v": 0
}
admin_id = auth_col.insert_one(admin).inserted_id

admin_doc = {
    "_id": admin_id,
    "userType": "Admin",
    "email": "admin123@alunos.ipca.pt",
    "status": "Active",
    "firstName": fake.first_name(),
    "lastName": fake.last_name(),
    "location": {
        "address": fake.street_address(),
        "latitude": float(fake.latitude()),
        "longitude": float(fake.longitude()),
        "city": fake.city(),
        "district": fake.distrito()
    },
    "birthDate": datetime.datetime.combine(fake.date_of_birth(minimum_age=30, maximum_age=60), datetime.datetime.min.time()),
    "createdAt": now,
    "updatedAt": now,
    "__v": 0
}
user_col.insert_one(admin_doc)

users_ids = []
for i in range(190):
    email = f"user{i}@alunos.ipca.pt"
    user = {
        "userType": "User",
        "email": email,
        "password": hash_password("password123"),
        "status": "Active",
        "registerDate": now,
        "lastAccessDate": now,
        "createdAt": now,
        "updatedAt": now,
        "__v": 0
    }
    auth_id = auth_col.insert_one(user).inserted_id

    user_doc = {
        "_id": auth_id,
        "userType": "User",
        "email": email,
        "status": "Active",
        "firstName": fake.first_name(),
        "lastName": fake.last_name(),
        "location": {
            "address": fake.street_address(),
            "latitude": float(fake.latitude()),
            "longitude": float(fake.longitude()),
            "city": fake.city(),
            "district": fake.distrito()
        },
        "birthDate": datetime.datetime.combine(fake.date_of_birth(minimum_age=18, maximum_age=50), datetime.datetime.min.time()),
        "createdAt": now,
        "updatedAt": now,
        "__v": 0
    }
    user_col.insert_one(user_doc)
    users_ids.append(auth_id)

owners_ids = []
for i in range(10):
    email = f"owner{i}@alunos.ipca.pt"

    # Inserir na coleção de autenticação (auth_col)
    owner = {
        "userType": "Owner",
        "email": email,
        "password": hash_password("password123"),
        "status": "Active",
        "registerDate": now,
        "lastAccessDate": now,
        "createdAt": now,
        "updatedAt": now,
        "__v": 0
    }
    auth_id = auth_col.insert_one(owner).inserted_id

    owner_doc = {
        "_id": auth_id,
        "userType": "Owner",
        "email": email,
        "status": "Active",
        "firstName": fake.first_name(),
        "lastName": fake.last_name(),
        "location": {
            "address": fake.street_address(),
            "latitude": float(fake.latitude()),
            "longitude": float(fake.longitude()),
            "city": fake.city(),
            "district": fake.distrito()
        },
        "birthDate": datetime.datetime.combine(fake.date_of_birth(minimum_age=25, maximum_age=65), datetime.datetime.min.time()),
        "createdAt": now,
        "updatedAt": now,
        "__v": 0
    }
    user_col.insert_one(owner_doc)

    owners_ids.append(auth_id)

sports_venues_ids = []
for i in range(25):
    owner_id = str(random.choice(owners_ids))
    venue = {
        "ownerId": owner_id,
        "sportsVenueType": random.choice(["7x7", "5x5", "9x9", "11x11"]),
        "status": random.choice(["Active", "Inactive"]),
        "sportsVenueName": f"Pavilhao {i}",
        "bookingMinDuration": 60,
        "bookingMinPrice": 50,
        "sportsVenuePictures": [],
        "hasParking": fake.boolean(),
        "hasShower": fake.boolean(),
        "hasBar": fake.boolean(),
        "location": {
            "address": fake.street_address(),
            "latitude": float(fake.latitude()),
            "longitude": float(fake.longitude()),
            "city": fake.city(),
            "district": fake.distrito()
        },
        "weeklySchedule": {},
        "numberOfRatings": 0,
        "createdAt": now,
        "updatedAt": now,
        "__v": 0
    }
    _id = sports_venue_col.insert_one(venue).inserted_id
    sports_venues_ids.append(_id)

for i in range(500):
    venue_id = str(random.choice(sports_venues_ids))
    owner_id = str(random.choice(owners_ids))
    start_time = fake.future_datetime(end_date="+30d")
    end_time = start_time + datetime.timedelta(hours=1)

    invited_users = random.sample(users_ids, 10)
    invited_users_ids_str = [str(user_id) for user_id in invited_users]

    booking = {
        "ownerId": owner_id,
        "sportsVenueId": venue_id,
        "bookingType": "Regular",
        "status": random.choice(["Active", "Cancelled", "Done", "Confirmed"]),
        "title": f"Reserva {i}",
        "bookingStartDate": start_time,
        "bookingEndDate": end_time,
        "bookingPrice": 50,
        "isPublic": True,
        "invitedUsersIds": invited_users_ids_str,
        "createdAt": now,
        "updatedAt": now,
        "__v": 0
    }
    booking_id = booking_col.insert_one(booking).inserted_id

    for user_id in invited_users:
        invite = {
            "bookingId": str(booking_id),
            "userId": str(user_id),
            "sportsVenueId": venue_id,
            "createdAt": now,
            "updatedAt": now
        }
        booking_invite_col.insert_one(invite)  
        sports_venue_booking_invites_col.insert_one(invite)  

all_user_ids = users_ids + owners_ids + [admin_id]
for _ in range(1500):
    login_date = fake.date_time_between(start_date='-30d', end_date='now')
    login_day = login_date.date().isoformat()
    login = {
        "userId": str(random.choice(all_user_ids)),
        "loginDate": login_date,
        "loginDay": login_day,
        "__v": 0
    }
    try:
        login_history_col.insert_one(login)
    except Exception as e:
        continue

statuses = ['Approved'] * 10 + ['Pending'] * 15 + ['Rejected'] * 15
selected_user_ids = random.sample(users_ids, len(statuses))

for uid, status in zip(selected_user_ids, statuses):
    request = {
        "userId": uid,
        "message": "Quero ser owner!",
        "status": status,
        "createdAt": now,
        "updatedAt": now,
        "__v": 0
    }
    try:
        owner_request_col.insert_one(request)
    except Exception as e:
        print(f"Erro owner requests: {e}")
        continue

for _ in range(100):
    uid = str(random.choice(users_ids))
    post = {
        "creatorId": uid,
        "creatorEmail": fake.email(),
        "fileName": fake.file_name(category='image'),
        "imageUrl": fake.image_url(),
        "createdAt": now,
        "updatedAt": now,
        "__v": 0
    }
    posts_col.insert_one(post)

booking_users_col.insert_many([
    {
        "_id": uid,
        "userType": "User" if uid in users_ids else "Owner",
        "email": auth_col.find_one({"_id": uid})["email"],
        "status": "Active",
        "createdAt": now,
        "updatedAt": now,
        "__v": 0
    } for uid in users_ids + owners_ids
])

booking_sports_venues_col.insert_many([
    {
        "_id": venue["_id"],
        "ownerId": venue["ownerId"],
        "sportsVenueType": venue["sportsVenueType"],
        "status": venue["status"],
        "bookingMinDuration": venue["bookingMinDuration"],
        "bookingMinPrice": venue["bookingMinPrice"],
        "weeklySchedule": venue["weeklySchedule"],
        "createdAt": now,
        "updatedAt": now,
        "__v": 0
    } for venue in sports_venue_col.find()
])

print("Base de dados populada e replicada com sucesso!")
