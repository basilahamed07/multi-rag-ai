from langchain_community.vectorstores import FAISS
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from groq import Groq
from langchain.chains import ConversationChain, LLMChain
from langchain_core.prompts import (
    ChatPromptTemplate,
    HumanMessagePromptTemplate,
    MessagesPlaceholder,
)
from langchain_core.runnables.history import RunnableWithMessageHistory

from langchain_community.chat_message_histories import ChatMessageHistory
from langchain_core.messages import SystemMessage
from langchain.chains.conversation.memory import ConversationBufferWindowMemory
from langchain_groq import ChatGroq
from langchain.prompts import PromptTemplate
import os
from dotenv import load_dotenv

load_dotenv()

chat_history = []


def get_result(path,user_question,user_id,chat_bot):
    model_name = "models/embedding-001"
    api_key =  os.getenv("gemeni_key")
    # db = FAISS.from_documents("../saving", embadding)
    print(api_key)
    embeddingsss = GoogleGenerativeAIEmbeddings(model=model_name, google_api_key=api_key) # creating embeddings
    new_vector_store = FAISS.load_local(
        path, embeddingsss, allow_dangerous_deserialization=True
    )
    results = new_vector_store.similarity_search(user_question , k=3, filter={"user_id": user_id,"chat_bot":chat_bot})
    print(results)
    for doc in results:
        print(f"Content: {doc.page_content}, Metadata: {doc.metadata}")
    return results



# def generate_answer(result, user_question,chat_bot_id_get):
#     groq_api_key = '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'
#     # model = "llama3-groq-70b-8192-tool-use-preview"
#     model = "llama-3.1-70b-versatile" 
#     memory = ConversationBufferWindowMemory(memory_key="history", return_messages=True)
#     groq_chat = ChatGroq(
#     groq_api_key=groq_api_key, 
#     model_name=model
# )
    

#     template = """
#     You are a helpful assistant. Help the user with their requests.
#     """
#     #to store the previous message like humand and bot
#     store = {}

#     #for get the exactily chat person things
#     def get_session_history(session_id: int):
#         if session_id not in store:
#             store[session_id] = ChatMessageHistory()
#         return store[session_id]
    
#     #by using the chat_bot_id:
#     chat_bot_id = chat_bot_id_get


#     system_prompt = f"Given the following text chunks:\n{result}\nGenerate a response to the query: {user_question}."
#     prompt_template = ChatPromptTemplate.from_messages(
#         [
#             SystemMessage(
#                 content=system_prompt
#             ),  
#             MessagesPlaceholder(
#                 variable_name="history"
#             ), 
#             HumanMessagePromptTemplate.from_template(
#                 "{query}"
#             ),  # This template is where the user's current input will be injected into the prompt.
#         ]
#     )

#     chain = prompt_template | groq_chat

#     chain_with_history = RunnableWithMessageHistory(
#         chain,
#         get_session_history,
#         input_messages_key="query",
#         history_messages_key="history"
#     )
    
#     config = {"configurable": {"session_id": chat_bot_id}}

#     response = chain_with_history.invoke({"query":user_question}, config=config)

#     print(response)
#     for trash in response:
#         print(trash)
#     # chat_history.append({'human': user_question, 'AI': response})
#     return response
#     # print("Chatbot:", response)




def generate_answer(result, user_question,chat_history=chat_history):
    groq_api_key = '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'
    # model = "llama3-groq-70b-8192-tool-use-preview"
    model = "llama-3.1-70b-versatile"
    conversational_memory_length = 5
    memory = ConversationBufferWindowMemory(k=conversational_memory_length, memory_key="chat_history", return_messages=True)
    groq_chat = ChatGroq(
    groq_api_key=groq_api_key, 
    model_name=model
    
)
    print(result)
    # system_prompt = f"Given the following text chunks:\n{result}\nGenerate a response to the query: {user_question}."
    
    system_prompt = (f"""
        Based on the retrieved results, your task is to provide a well-informed, context-aware response to the user's question from ,chat_history and Results.

        Chat History:
        {chat_history}

        Results:
        {result}

        User's Question:
        {user_question}

        """
)
    
    
    prompt = ChatPromptTemplate.from_messages(
        [
            SystemMessage(
                content=system_prompt
            ),  # This is the persistent system prompt that is always included at the start of the chat.
            MessagesPlaceholder(
                variable_name="chat_history"
            ),  # This placeholder will be replaced by the actual chat history during the conversation. It helps in maintaining context.
            HumanMessagePromptTemplate.from_template(
                "{human_input}"
            ),  # This template is where the user's current input will be injected into the prompt.
        ]
    )

    conversation = LLMChain(
        llm=groq_chat,  # The Groq LangChain chat object initialized earlier.
        prompt=prompt,  # The constructed prompt template.
        verbose=True,   # Enables verbose output, which can be useful for debugging.
        memory=memory,  # The conversational memory object that stores and manages the conversation history.
    )

    response = conversation.predict(human_input=user_question)
    chat_history.append({'human': user_question, 'AI': response})
    print(chat_history)
    return response
    # print("Chatbot:", response)