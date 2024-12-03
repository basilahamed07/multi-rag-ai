from flask import Flask
from flask_cors import CORS
from flask_migrate import Migrate
from werkzeug.utils import secure_filename
from flask_jwt_extended import JWTManager,jwt_manager,get_jwt_identity
from dotenv import load_dotenv
import os
from models import db
from router import register_routes
load_dotenv()


#initlizingi the flask 
app = Flask(__name__)

# Configuring the database
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv("DATABASE_URL")  # SQLite database for simplicity

# --------------------- store the files----------------------------
app.config['csv_file'] = os.getenv("csv_file")  # Folder where uploaded files will be stored
app.config['pdf_file'] = os.getenv("pdf_file")  # Folder where uploaded files will be stored
app.config['docx_file'] = os.getenv("docx_file")  # Folder where uploaded files will be stored
app.config['image_file'] = os.getenv("image_file")  # Folder where uploaded files will be stored
app.config['Json_file'] = os.getenv("Json_file")  # Folder where uploaded files will be stored
app.config['youtube_file'] = os.getenv("youtube_file")  # Folder where uploaded files will be stored
app.config['wikipedia_file'] = os.getenv("wikipedia_file")  # Folder where uploaded files will be stored
app.config['pptx_file'] = os.getenv("pptx_file")  # Folder where uploaded files will be stored

# --------------------------------------------------------------------------

# for check the correct formate for get the correct file input
app.config['ALLOWED_EXTENSIONS'] = {"csv","pdf","pptx","json","docx"}  # Allowed file extensions

#get the security key for csrf prdaction
app.secret_key = os.getenv("SECRET_KEY")  # Required for forms (CSRF protection)

#for get the jwd tokens
app.config['JWT_SECRET_KEY'] = os.getenv("JWT_SECRET_KEY")

#configure and initilize the apps for below code


CORS(app)


db.init_app(app)
migrate = Migrate(app,db)
jwd = JWTManager(app)

# @register the api routers

register_routes(app)

#create the database 


with app.app_context():
    db.create_all()



if __name__ == "__main__":
    app.run(debug=True)