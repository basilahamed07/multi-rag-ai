import os
from dotenv import load_dotenv
from langchain_community.vectorstores import FAISS
from langchain_google_genai import GoogleGenerativeAIEmbeddings



load_dotenv()


def embadding_and_store(chuked,bot_name):
    model_name = "models/embedding-001"
    google_api_key = os.getenv("gemeni_key")
    embadding = GoogleGenerativeAIEmbeddings(model=model_name,google_api_key=google_api_key)
    path = f"./uploads/vector_database/index"
    if not os.path.exists("./uploads/vector_database/index"):
        db = FAISS.from_documents(chuked, embadding)
        db.save_local(path)
    else:
        db = FAISS.load_local(path,embadding,allow_dangerous_deserialization=True)
        db.add_documents(documents=chuked)  # Corrected line, passing both together
        db.save_local(path)
    return "new vector was stored"