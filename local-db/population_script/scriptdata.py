from pymongo import MongoClient, errors
from faker import Faker
from bson import ObjectId
import random
import bcrypt
import time
from datetime import datetime, timedelta

fake = Faker('pt_PT')
client = MongoClient("mongodb://admin:password@mongodb:27017/?authSource=admin&replicaSet=rs0&directConnection=true")

def wait_for_replica_set_ready(client, retries=30, delay=5):
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

def generate_random_date(start_year=1975, end_year=2005):
    # Data inicial e final
    start_date = datetime(start_year, 1, 1)
    end_date = datetime(end_year, 12, 31)
    # Total de dias entre as datas
    delta = end_date - start_date
    random_days = random.randint(0, delta.days)
    # Gera a data aleatória
    random_date = start_date + timedelta(days=random_days)
    # Formata no padrão pedido
    formatted_date = random_date.strftime('%Y-%m-%dT00:00:00.000+00:00')
    return formatted_date

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
notification_col = user_db["Notifications"]
sports_venue_col = sports_venue_db["SportsVenues"]
sports_venue_booking_invites_col = sports_venue_db["BookingInvites"]
booking_col = booking_db["Bookings"]
booking_invite_col = booking_db["BookingInvites"]
booking_users_col = booking_db["Users"]
booking_sports_venues_col = booking_db["SportsVenues"]

def hash_password(password):
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode()

now = datetime.utcnow()

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
    #"birthDate": datetime.datetime.combine(fake.date_of_birth(minimum_age=25, maximum_age=65), datetime.datetime.min.time()),
    "birthDate": generate_random_date(),
    "createdAt": now,
    "updatedAt": now,
    "__v": 0
}
user_col.insert_one(admin_doc)

print("Admin inserted successfully")

users_ids = []
for i in range(190):
    email = f"user{i}{i}{i}@alunos.ipca.pt"
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
        "phoneNumber": fake.phone_number(),
        "firstName": fake.first_name(),
        "lastName": fake.last_name(),
        "location": {
            "address": fake.street_address(),
            "latitude": float(fake.latitude()),
            "longitude": float(fake.longitude()),
            "city": fake.city(),
            "district": fake.distrito()
        },
        #"birthDate": datetime.datetime.combine(fake.date_of_birth(minimum_age=25, maximum_age=65), datetime.datetime.min.time()),
        "birthDate": generate_random_date(),
        "createdAt": now,
        "updatedAt": now,
        "__v": 0
    }
    user_col.insert_one(user_doc)
    users_ids.append((auth_id, email))

print("Regular Users inserted successfully")

owners_ids = []
owner_emails = [
    "a30766@alunos.ipca.pt",
    "a16818@alunos.ipca.pt",
    "a33456@alunos.ipca.pt"
]
custom_owner_ids = []
for email in owner_emails:
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
        "phoneNumber": fake.phone_number(),
        "firstName": fake.first_name(),
        "lastName": fake.last_name(),
        "location": {
            "address": fake.street_address(),
            "latitude": float(fake.latitude()),
            "longitude": float(fake.longitude()),
            "city": fake.city(),
            "district": fake.distrito()  # Garante que fake.distrito existe ou usa uma lista
        },
        #"birthDate": datetime.datetime.combine(fake.date_of_birth(minimum_age=25, maximum_age=65), datetime.datetime.min.time()),
        "birthDate": generate_random_date(),
        "createdAt": now,
        "updatedAt": now,
        "__v": 0
    }
    user_col.insert_one(owner_doc)

    owners_ids.append(auth_id)
    custom_owner_ids.append(auth_id)

for i in range(3):
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
        "phoneNumber": fake.phone_number(),
        "firstName": fake.first_name(),
        "lastName": fake.last_name(),
        "location": {
            "address": fake.street_address(),
            "latitude": float(fake.latitude()),
            "longitude": float(fake.longitude()),
            "city": fake.city(),
            "district": fake.distrito()
        },
        #"birthDate": datetime.datetime.combine(fake.date_of_birth(minimum_age=25, maximum_age=65), datetime.datetime.min.time()),
        "birthDate": generate_random_date(),        
        "createdAt": now,
        "updatedAt": now,
        "__v": 0
    }
    user_col.insert_one(owner_doc)

    owners_ids.append(auth_id)

print("Owners inserted successfully")

standard_schedule = {
    day: [
        {"startTime": "08:00", "endTime": "12:00"},
        {"startTime": "14:00", "endTime": "18:00"}
    ]
    for day in ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
}
sports_venues_ids = []
for i in range(5):
    owner_id = str(random.choice(owners_ids))
    venue = {
        "ownerId": owner_id,
        "sportsVenueType": random.choice(["7x7", "5x5", "9x9", "11x11"]),
        "status": "Inactive",
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
        "weeklySchedule": standard_schedule,
        "numberOfRatings": 0,
        "createdAt": now,
        "updatedAt": now,
        "__v": 0
    }
    _id = sports_venue_col.insert_one(venue).inserted_id
    sports_venues_ids.append(_id)

print("Inserted inactive sports venues")

active_sports_venues = [
    {
        "ownerId": custom_owner_ids[0],
        "sportsVenueType": "11x11",
        "status": "Active",
        "sportsVenueName": "Campo da Pinguelinha",
        "bookingMinDuration": 60,
        "bookingMinPrice": 50,
        "sportsVenuePictures": [
            {
                "fileName": "c698a3db-13e6-474a-989e-e00d70297291-487877095_1008553798071605_8432908271905580246_n.jpg",
                "imageURL": "https://storage.googleapis.com/plat-centro-neurosensorial.appspot.com/c698a3db-13e6-474a-989e-e00d70297291-487877095_1008553798071605_8432908271905580246_n.jpg",
                "_id": "6857fcb53f7fd6f89c8d8f1d"
            },
            {
                "fileName": "394fd43d-bb67-46a8-9dd0-cb1bfe641b60-487822698_1008553664738285_4563225499081573169_n.jpg",
                "imageURL": "https://storage.googleapis.com/plat-centro-neurosensorial.appspot.com/394fd43d-bb67-46a8-9dd0-cb1bfe641b60-487822698_1008553664738285_4563225499081573169_n.jpg",
                "_id": "6857fcb53f7fd6f89c8d8f1e"
            },
            {
                "fileName": "870ac59f-0676-4a23-bef3-16f52ca2ec9b-1749159821013-campo_do_macieira.jpg",
                "imageURL": "https://storage.googleapis.com/plat-centro-neurosensorial.appspot.com/870ac59f-0676-4a23-bef3-16f52ca2ec9b-1749159821013-campo_do_macieira.jpg",
                "_id": "6857fcb53f7fd6f89c8d8f1f"
            }
        ],
        "hasParking": fake.boolean(),
        "hasShower": fake.boolean(),
        "hasBar": fake.boolean(),
        "location": {
            "address": "Rua da Pinguelinha",
            "latitude": 41.4308352,
            "longitude": -8.6503933,
            "city":"Barcelos",
            "district": "Braga"
        },
        "weeklySchedule": standard_schedule,
        "numberOfRatings": 0,
        "createdAt": now,
        "updatedAt": now,
        "__v": 0
    },
    {
        "ownerId": custom_owner_ids[0],
        "sportsVenueType": "11x11",
        "status": "Active",
        "sportsVenueName": "Estadio Cidade de Barcelos",
        "bookingMinDuration": 60,
        "bookingMinPrice": 50,
        "sportsVenuePictures": [
            {
                "fileName": "35c32117-9752-4efe-a3be-50ada47e3f48-gil2.jpeg",
                "imageURL": "https://storage.googleapis.com/plat-centro-neurosensorial.appspot.com/35c32117-9752-4efe-a3be-50ada47e3f48-gil2.jpeg",
                "_id": "6857fda03f7fd6f89c8d8f4e"
            },
            {
                "fileName": "58761ace-0229-41a8-85cd-44141f29982d-gil1.jpeg",
                "imageURL": "https://storage.googleapis.com/plat-centro-neurosensorial.appspot.com/58761ace-0229-41a8-85cd-44141f29982d-gil1.jpeg",
                "_id": "6857fda03f7fd6f89c8d8f4f"
            }
        ],
        "hasParking": fake.boolean(),
        "hasShower": fake.boolean(),
        "hasBar": fake.boolean(),
        "location": {
            "address": "Rua de Raizes",
            "latitude": 41.5543817,
            "longitude": -8.6184812,
            "city": "Barcelos",
            "district": "Braga"
        },
        "weeklySchedule": standard_schedule,
        "numberOfRatings": 0,
        "createdAt": now,
        "updatedAt": now,
        "__v": 0
    },
    {
        "ownerId": custom_owner_ids[1],
        "sportsVenueType": "11x11",
        "status": "Active",
        "sportsVenueName": "Estadio da Luz",
        "bookingMinDuration": 60,
        "bookingMinPrice": 50,
        "sportsVenuePictures": [
            {
                "fileName": "6c5d6d94-8ffe-4e4c-a250-6fe0ddb942ac-luz2.jpeg",
                "imageURL": "https://storage.googleapis.com/plat-centro-neurosensorial.appspot.com/6c5d6d94-8ffe-4e4c-a250-6fe0ddb942ac-luz2.jpeg",
                "_id": "6857ffa53f7fd6f89c8d8f91"
            },
            {
                "fileName": "44191e96-708b-4332-b7c5-ab45a3996d2d-luz1.jpg",
                "imageURL": "https://storage.googleapis.com/plat-centro-neurosensorial.appspot.com/44191e96-708b-4332-b7c5-ab45a3996d2d-luz1.jpg",
                "_id": "6857ffa53f7fd6f89c8d8f92"
            }
        ],
        "hasParking": True,
        "hasShower": True,
        "hasBar": True,
        "location": {
            "address": "Avenida Eusebio da Silva Ferreira",
            "latitude": 38.7574463,
            "longitude": -9.1775128,
            "city": "Lisboa",
            "district": "Lisboa"
        },
        "weeklySchedule": standard_schedule,
        "numberOfRatings": 0,
        "createdAt": now,
        "updatedAt": now,
        "__v": 0
    },
    {
        "ownerId": custom_owner_ids[2],
        "sportsVenueType": "11x11",
        "status": "Active",
        "sportsVenueName": "Estadio do Dragao",
        "bookingMinDuration": 60,
        "bookingMinPrice": 50,
        "sportsVenuePictures": [
            {
                "fileName": "a8654122-1133-43dc-aa25-ea591de45821-dragao2.jpg",
                "imageURL": "https://storage.googleapis.com/plat-centro-neurosensorial.appspot.com/a8654122-1133-43dc-aa25-ea591de45821-dragao2.jpg",
                "_id": "685800193f7fd6f89c8d8fb9"
            },
            {
                "fileName": "47f64354-cf3b-48a0-8ab1-bc3eb4925440-dragao1.jpg",
                "imageURL": "https://storage.googleapis.com/plat-centro-neurosensorial.appspot.com/47f64354-cf3b-48a0-8ab1-bc3eb4925440-dragao1.jpg",
                "_id": "6858003d3f7fd6f89c8d8fd4"
            }
        ],
        "hasParking": True,
        "hasShower": True,
        "hasBar": True,
        "location": {
            "address": "Via Futebol Clube do Porto",
            "latitude": 41.1607629,
            "longitude": -8.5822002,
            "city": "Porto",
            "district": "Porto"
        },
        "weeklySchedule": standard_schedule,
        "numberOfRatings": 0,
        "createdAt": now,
        "updatedAt": now,
        "__v": 0
    },
]
for venue in active_sports_venues:
    _id = sports_venue_col.insert_one(venue).inserted_id
    sports_venues_ids.append(_id)
    print(f"Inserted sports venue: {venue['sportsVenueName']} (ID: {_id})")

numberOfEvents = 9
for i in range(700):
    venue_id = str(random.choice(sports_venues_ids))
    owner_id = str(random.choice(owners_ids))
    start_time = fake.date_time_between(
        start_date=datetime(2025, 1, 1),
        end_date=datetime(2025, 12, 31)
    )
    end_time = start_time + timedelta(hours=1)

    invited_users = random.sample(users_ids, 10)
    invited_users_ids_str = [str(user_id[0]) for user_id in invited_users]

    bookingType = ""
    if numberOfEvents > 0:
        bookingType = "Event"
        numberOfEvents = numberOfEvents - 1
    else:
        bookingType = "Regular"
    booking = {
        "ownerId": owner_id,
        "sportsVenueId": venue_id,
        "bookingType": bookingType,
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

    for user_id, _ in invited_users:
        status = ""
        if start_time < datetime.now():
            status = random.choice(["Accepted", "Rejected", "Pending"])
        else:
            status = random.choice(["Accepted", "Rejected", "Done"])
        
        sportsVenue = sports_venue_col.find_one({"_id": ObjectId(venue_id)})
        invite = {
            "bookingId": str(booking_id),
            "userId": str(user_id),
            "sportsVenueId": venue_id,
            "sportsVenueName": sportsVenue.get("sportsVenueName"),
            "bookingStartDate": start_time,
            "bookingEndDate": end_time,
            "status": status,
            "createdAt": now,
            "updatedAt": now
        }
        booking_invite_col.insert_one(invite)  
        sports_venue_booking_invites_col.insert_one(invite)  

print("Created Bookings")

user_ids_only = [id_email[0] for id_email in users_ids]
all_user_ids = user_ids_only + owners_ids + [admin_id]
for _ in range(800):
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

print("Created Login History")

statuses = ['Approved'] * 10 + ['Pending'] * 15 + ['Rejected'] * 15
selected_user_ids = random.sample(user_ids_only, len(statuses))

def generate_unique_request_number(collection):
    while True:
        number = str(random.randint(10**9, 10**10 - 1))  # Gera 10 dígitos
        if not collection.find_one({"requestNumber": number}):
            return number

for (uid, email), status in zip(users_ids, statuses):
    request_number = generate_unique_request_number(owner_request_col)

    request = {}
    if status == "Pending":
        request = {
            "userId": str(uid),
            "userEmail": email,
            "message": "Quero ser owner!",
            "requestNumber": request_number,
            "status": status, 
            "createdAt": now,
            "updatedAt": now,
            "__v": 0
        }
    elif status == "Approved":
        request = {
            "userId": str(uid),
            "userEmail": email,
            "message": "Quero ser owner!",
            "requestNumber": request_number,
            "status": status, 
            "createdAt": now,
            "updatedAt": now,
            "response" : "You have been approved as an owner!",
            "reviewedAt" : now,
            "reviewedBy" : "admin123@alunos.ipca.pt",
            "__v": 0
        }
    elif status == "Rejected":
        request = {
            "userId": str(uid),
            "userEmail": email,
            "message": "Quero ser owner!",
            "requestNumber": request_number,
            "status": status, 
            "createdAt": now,
            "updatedAt": now,
            "response" : "You have NOT been approved as an owner!",
            "reviewedAt" : now,
            "reviewedBy" : "admin123@alunos.ipca.pt",
            "__v": 0
        }

    try:
        # Inserir pedido na collection de owner requests
        result = owner_request_col.insert_one(request)
        
        # Criar notificação dependendo do status
        notification = {
            "userId": str(uid),
            "ownerRequestId": str(result.inserted_id),
            "userEmail": email,
            "createdAt": now,
            "updatedAt": now,
            "status": "Unread"
        }

        if status == "Pending":
            notification["adminOnly"] = True
        elif status == "Approved":
            notification["adminOnly"] = False
            notification["isApprovedRequest"] = True
            notification["content"] = "Congratulations! You have been approved as an owner."
        elif status == "Rejected":
            notification["adminOnly"] = False
            notification["isApprovedRequest"] = False
            notification["content"] = "Unfortunately, your request to become an owner was rejected."

        # Só criar notificação se a estrutura estiver completa (evita erro no "Pending")
        if "adminOnly" in notification:
            notification_col.insert_one(notification)

    except Exception as e:
        print(f"Erro owner requests: {e}")
        continue

print("Created Owner Requests")

booking_users_col.insert_many([
    {
        "_id": uid if isinstance(uid, ObjectId) else uid[0],
        "userType": "User" if (uid in [u[0] for u in users_ids]) else "Owner",
        "email": auth_col.find_one({"_id": uid if isinstance(uid, ObjectId) else uid[0]})["email"],
        "status": "Active",
        "createdAt": now,
        "updatedAt": now,
        "__v": 0
    }
    for uid in user_ids_only + owners_ids
])

booking_sports_venues_col.insert_many([
    {
        "_id": venue["_id"],
        "ownerId": venue["ownerId"],
        "sportsVenueName": venue["sportsVenueName"],
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