from flask import jsonify, request
from werkzeug.security import generate_password_hash, check_password_hash
from models import AI_info,User,File,db,Chat_bot
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
import os
from werkzeug.utils import secure_filename
from ai_processing.vector_store import embadding_and_store
from ai_processing.retrive_process import get_result,generate_answer
from ai_processing.preprocessing import file_load_types,wikidepid_summery,youtube_summery

def get_file_details(file_id):
    file = File.query.filter_by(id=file_id).first()
    if file:
        print(file.to_dict())
        return file.to_dict()  # Return file details as dictionary
    return None


# for store the file 
def csv_file_save():
    pass

vector_path = f"./uploads/vector_database/index"

allow_files = {"csv_file":csv_file_save}



def register_routes(app):
    # -----------------------for store the file accoding to the file type----------------------------------

    file_type_path = {"text/csv":"csv_file","application/pdf":"pdf_file","application/vnd.openxmlformats-officedocument.wordprocessingml.document":"docx_file","application/vnd.openxmlformats-officedocument.presentationml.presentation":"pptx_file","application/json":"Json_file"}
    #file store process

    def file_store_function(file_path,filename,file): # Set the upload path
        print("indide the file store function")
        upload_path = os.path.join(app.config[file_path], filename)
        print(upload_path)
                        # Ensure the upload folder exists
        if not os.path.exists(app.config[file_path]):
            os.makedirs(app.config[file_path])

                        # Save the file to the specified path
        file.save(upload_path)

        print(f"File saved successfully to {upload_path}")  
        return upload_path

# --------------------------------------------login and register-----------------------------------------
    #to get the all users
    @app.route("/users", methods=["GET"])
    @jwt_required()
    def get_users():
        users = User.query.all()
        return jsonify([trash.to_dict() for trash in users])
    


    #to register the users
    @app.route('/register', methods=['POST'])
    def register_user():

        #get the data from the json  file
        data = request.json
        #check if the data was correct or not
        if 'username' not in data or 'password' not in data:
            return jsonify({'error': 'Username and password required'}), 400
        
        #check if the username is present or not
        if User.query.filter_by(username=data['username']).first():
            return jsonify({'error': 'User already exists'}), 400
        #create the password in encripted file
        hashed_password = generate_password_hash(data['password'])
        
        # adding the User table for username and password
        new_user = User(username=data['username'], password=hashed_password)
        
        try:
            db.session.add(new_user)
            db.session.commit()
            return jsonify({'message': 'User registered successfully'}), 201
        except Exception as e:
            db.session.rollback()
            return jsonify({'error': str(e)}), 500
        


    #login the users
    @app.route('/login', methods=['POST'])
    def login_user():
        data = request.json
        if 'username' not in data or 'password' not in data:
            return jsonify({'error': 'Username and password required'}), 400
        
        user = User.query.filter_by(username=data['username']).first()
        if not user or not check_password_hash(user.password, data['password']):
            return jsonify({'error': 'Invalid credentials'}), 401
        
        access_token = create_access_token(identity=user.id)
        return jsonify({
            'message': 'Login successful',
            'access_token': access_token,
            'user': {
                'username': user.username,
                'userId': user.id,
            }
        }), 200
    
# -------------------------------------------- end login and register-----------------------------------------



# -------------------------------------------- create the bots and ai procrss login and register-----------------------------------------

    # for creaet the bot for individual files
    @app.route("/bot-create", methods=["GET", "POST"])
    @jwt_required()
    def bot_create():
        if request.method == 'POST':

            # -------------------------- check the file are presnt or not-----------------------------
            # Check if the file is in the request
            if 'file' not in request.files:
                return 'No file part', 400

            file = request.files['file']

            # Check if the filename is empty
            if file.filename == '':
                return 'No selected file', 400


            # Define the allowed file check function
            def allowed_file(filename):
                return '.' in filename and filename.rsplit('.', 1)[1].lower() in app.config['ALLOWED_EXTENSIONS']

            # If the file is allowed, process it
            if file and allowed_file(file.filename):
                # print("check the file extension")
                filename = secure_filename(file.filename)
                file_type = file.mimetype
                user_id = get_jwt_identity()  # Ensure that user_id is available in the request context

                # Get the bot_name from the request data (ensure it's being sent by the client)
                bot_name = request.form.get('bot_name', None)
                if not bot_name:
                    return 'Bot name is required', 400


# --------------------------end of the procsss of file checking--------------------------------
                
                
                path_file = file_type_path[file_type]
                save_result = file_store_function(path_file,filename,file)
                print(f"{save_result} value is here")




# ---------------------------------------for processing the file accoding to the file_type---------------------------------------                


                data = file_load_types[file_type](save_result)
                for trash in data:
                    trash.metadata["user_id"] = user_id
                    trash.metadata["chat_bot"] = bot_name


                # Embedding and storing the file (ensure the function works as expected)
                embaddding_message = embadding_and_store(chuked=data,bot_name=bot_name)
                print(embaddding_message)
                
                # Create a new File record and add it to the database
                new_file = File(
                    filename=filename,
                    file_type=file_type,
                    file_data=file.read(),  # Read the file content (be cautious with large files)
                    user_id=user_id
                )
                db.session.add(new_file)
                db.session.commit()

                # Fetch the newly added file's ID
                file_id = File.query.filter_by(filename=filename).first()
                
                
                # Create the bot using the provided bot_name
                new_chatbot = Chat_bot(
                    bot_name=bot_name,
                    user_id=user_id,
                    file_id=file_id.id  # Assuming `file_id` is a foreign key reference
                )
                db.session.add(new_chatbot)
                db.session.commit()
                print(f"File record added to database: {new_file}")
                return "File uploaded and bot created successfully", 200            
            return "Invalid file type. Only CSV files are allowed.", 400
        return "Good request", 200

            # return render_template('upload.html')
    

    # for wikipedia content 


    # Assuming the app is already initialized as `app`
    @app.route("/text_bot_create", methods=["POST"])
    @jwt_required()
    def text_bot_create():
        if request.method == 'POST':

            # Get the text from the frontend (it should be sent as JSON or form data)
            text = request.form.get('text', None)  # Ensure the key 'text' is in the request
            bot_name = request.form.get('bot_name', None)  # Ensure the key 'text' is in the request
            user_id = get_jwt_identity() 
            # Validate if text is provided
            if not text:
                return jsonify({"message": "Text is required"}), 400

            file_names_here="wikipedia_file"
            file_name_save = "wikipedia"

            if "youtube" in text:
                file_names_here="youtube_file"
                file_name_save = "youtube"

            
            # Define the directory to store the txt file (you can change the path as needed)
            file_directory = app.config[file_names_here]  # Set this in your app config
            if not os.path.exists(file_directory):
                os.makedirs(file_directory)

            # Generate a secure filename
             # Get the current user's identity from JWT
            filename = f"{file_name_save}_{bot_name}_{secure_filename('text_file.txt')}"

            # Create the full path to the file
            file_path = os.path.join(file_directory, filename)

            # Write the text into the file
            try:
                with open(file_path, 'w') as f:
                    f.write(text)
                
                
                if file_names_here == "youtube_file":
                    data = youtube_summery(query=text)
                    for trash in data:
                        trash.metadata["user_id"] = user_id
                        trash.metadata["chat_bot"] = bot_name
                else:
                #ai processing chunked the data 
                    data = wikidepid_summery(query=text)
                    for trash in data:
                        trash.metadata["user_id"] = user_id
                        trash.metadata["chat_bot"] = bot_name
                
                # Embedding and storing the file (ensure the function works as expected)
                embaddding_message = embadding_and_store(chuked=data,bot_name=bot_name)
                print(embaddding_message)

                 # Store the file information in the database
                # Read the file content into a binary format (caution with large files)
                with open(file_path, 'rb') as file:
                    file_data = file.read()
                        # Create a new File record and add it to the database
                new_file = File(
                    filename=filename,
                    file_type='text/plain',  # You can modify this based on the actual file type
                    file_data=file_data,
                    user_id=user_id
                )
                db.session.add(new_file)
                db.session.commit()
                        # Fetch the newly added file's ID (you can skip this if not needed)
                file_id = new_file.id
                        # Create a new chatbot record in the database
                new_chatbot = Chat_bot(
                    bot_name=bot_name,
                    user_id=user_id,
                    file_id=file_id  # Assuming `file_id` is a foreign key reference
                )
                db.session.add(new_chatbot)
                db.session.commit()
                print(f"File record added to database: {new_file}")
                return jsonify({"message": "File uploaded and bot created successfully"}), 200
           

            except Exception as e:
                return jsonify({"message": f"An error occurred: {str(e)}"}), 500
            

        return jsonify({"message": "Bad request"}), 400



    # @app.route('/chat', methods=['GET', 'POST'])
    # @jwt_required()
    # def chat():
    #     if request.method == 'POST':
    #         user_id = get_jwt_identity()
    #         user_question = request.form.get('question', "No question provided")
    #         chat_bot = request.form.get('bot_name', "No question provided")
    #         if user_question == "No question provided":
    #             return jsonify({'error': 'Question is required'}), 400


    #         # Call the get_result function to get the answer
    #         try:
    #             test_result = get_result(vector_path, user_question,user_id,chat_bot)
    #             print(test_result)

    #             # Send back a response with the result
    #             return jsonify({
    #                 'user_id': user_id,
    #                 'question': user_question,
    #                 'answer': test_result
    #             }), 200
    #         except Exception as e:
    #         # In case of any error, return a 500 error with the error message
    #             print(f"Error: {e}")
    #             return jsonify({'error': str(e)}), 500


    @app.route('/chat', methods=['GET', 'POST'])
    @jwt_required()
    def chat():
        if request.method == 'POST':
            user_id = get_jwt_identity()  # Ensure that user_id is available in the request context

            # Get question from form data; default if not present
            user_question = request.form.get('question', "No question provided")
            chat_bot = request.form.get('bot_name', "No question provided")
            if user_question == "No question provided":
                return jsonify({'error': 'Question is required'}), 400
            


            # Call the get_result function to get the answer
            try:
                result = get_result(vector_path, user_question,user_id,chat_bot)

                responce = generate_answer(result, user_question)

                # filter get the file_id by filer by cht_bot
                file_id = Chat_bot.query.filter_by(bot_name=chat_bot).first()


                # Create a new File record and add it to the database
                new_file = AI_info(
                    questions=user_question,  # store the question from the user
                    file_id=file_id.file_id,  # Read the file content (be cautious with large files)
                    user_id=user_id,
                    Chat_bot_id=file_id.id
                )
                db.session.add(new_file)
                db.session.commit()
                print(f"File record added to database: {new_file}")

                return jsonify({'response': responce})


            except Exception as e:
            # In case of any error, return a 500 error with the error message
                print(f"Error: {e}")
                return jsonify({'error': str(e)}), 500

        return "error", 401

    @app.route('/chat/history', methods=['GET'])
    @jwt_required()
    def get_chat_history():
        user_id = get_jwt_identity()  # Get the current user's ID from JWT
        file_id = request.args.get('file_id', type=int)  # Get the file_id from query params

        # Build the query to filter by both user_id and optionally file_id
        if file_id:  # If file_id is provided, filter by file_id
            history = AI_info.query.filter_by(user_id=user_id, file_id=file_id).all()
        else:  # If no file_id, return all history for the user
            history = AI_info.query.filter_by(user_id=user_id).all()

        # Prepare the history data to include the question, answer, and file_id
        history_data = [{'question': h.questions} for h in history]

        return jsonify({'history': history_data})
    
    @app.route('/bots', methods=['GET'])
    @jwt_required()
    def get_bot():
        user_id = get_jwt_identity()  # Get the current user
        bots = Chat_bot.query.filter_by(user_id=user_id).all()
        bots_report = [{'bot_name': b.bot_name, "file_id": b.file_id} for b in bots]
        return jsonify({'history':bots_report})