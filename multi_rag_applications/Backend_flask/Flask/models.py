from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()


#for user getting informaction
class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    username = db.Column(db.String(100), unique=True, nullable=False)
    password = db.Column(db.String(256), nullable=False)
    positions = db.Column(db.String(10), nullable=False, default='normal')

    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'positions': self.positions,
        }
    

#chat bot creating informaction 
class Chat_bot(db.Model):
    __tablename__ = 'Chat_bot'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    bot_name = db.Column(db.String(100), unique=True, nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    users = db.relationship('User', backref=db.backref('Chat_bot', lazy=True))
    file_id = db.Column(db.Integer, db.ForeignKey('file_details.id'), nullable=False)  # Foreign key to File
    file_details = db.relationship('File', backref=db.backref('Chat_bot', lazy=True)) 
    # positions = db.Column(db.String(10), nullable=False, default='normal')

    def to_dict(self):
        return {
            'id': self.id,
            'bot_name': self.bot_name,
            'user_id': self.user_id,
            "file_id":self.file_id
        }


#IT WILL HAVE THE WHAT TYPES OF DATA OR FILE HAVE !
class File(db.Model):
    __tablename__ = 'file_details'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    filename = db.Column(db.String(100), nullable=False)  # Corrected typo
    file_type = db.Column(db.String(256), nullable=False)
    file_data = db.Column(db.LargeBinary, nullable=False)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    users = db.relationship('User', backref=db.backref('file_details', lazy=True))

    def to_dict(self):
        return {
            'id': self.id,
            'filename': self.filename,
            'file_type': self.file_type,
            'created_at': self.created_at,
            "user_id":self.user_id
        }
    

# THIS WILL CONTAIN THE CHATHISTORY INFORMACTION
class AI_info(db.Model):
    __tablename__ = 'AI_info'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    questions = db.Column(db.String(255), nullable=False)
    answer = db.Column(db.String(10000), nullable=False)
    file_id = db.Column(db.Integer, db.ForeignKey('file_details.id'), nullable=False)  # Foreign key to File
    file_details = db.relationship('File', backref=db.backref('AI_info', lazy=True))  # Corrected relationship
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    users = db.relationship('User', backref=db.backref('AI_info', lazy=True))
    Chat_bot_id = db.Column(db.Integer, db.ForeignKey('Chat_bot.id'), nullable=False)
    Chat_bot = db.relationship('Chat_bot', backref=db.backref('AI_info', lazy=True)) 

    def to_dict(self):
        return {
            'id': self.id,
            'questions': self.questions,
            'file_id': self.file_id,  # Correct field referencing the File
            'user_id': self.user_id,
            "Chat_bot_id":self.Chat_bot_id  # Correct field referencing the User
        }
