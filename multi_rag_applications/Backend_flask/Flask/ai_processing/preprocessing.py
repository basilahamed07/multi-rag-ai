# for this code contain the load the document and chunk the data accoding to the file type
from langchain_text_splitters import RecursiveCharacterTextSplitter

text_splitter = RecursiveCharacterTextSplitter(
    # Set a really small chunk size, just to show.
    chunk_size=500,
    chunk_overlap=50,
    length_function=len,
    is_separator_regex=False,
)

# 1)
#load csv data
from langchain_community.document_loaders.csv_loader import CSVLoader

def csv_load_chunk(path):
    csv_data = CSVLoader(path)
    data = csv_data.load_and_split()
    return data


# 2)
# load the pdf by using PyPDFLoader

from langchain_community.document_loaders import PyPDFLoader
    

def pdf_load_chunk(path):
    pdf_data = PyPDFLoader(path)
    data = pdf_data.load_and_split()
    return data



# 3)
#load the docx formate 
from langchain_community.document_loaders import Docx2txtLoader



def docx_load_chunk(path,text_splitter=text_splitter):
    docx_load = Docx2txtLoader(path)
    data = docx_load.load_and_split()
    data = text_splitter.split_documents(data)
    return data


# 5)
#by using the youtube formate:

from langchain_community.document_loaders import YoutubeLoader
from langchain_community.document_loaders.youtube import TranscriptFormat
def youtube_summery(query,text_splitter=text_splitter):
    data = YoutubeLoader.from_youtube_url(
    query, add_video_info=False,
    transcript_format=TranscriptFormat.CHUNKS,
    chunk_size_seconds=30,
    ).load_and_split()
    return data

# 6)
# by using the wikipedia
from langchain_community.document_loaders import WikipediaLoader

def wikidepid_summery(query,text_splitter=text_splitter):
    data = WikipediaLoader(query=query, load_max_docs=1).load_and_split()
    data = text_splitter.split_documents(data)
    return data


# 7)
# by using the pptx
from langchain_community.document_loaders import UnstructuredPowerPointLoader

def pptx_load_and_chunk(path,text_splitter=text_splitter):
    loader = UnstructuredPowerPointLoader(path)
    data = loader.load_and_split()
    data = text_splitter.split_documents(data)
    return data


#websote load
from langchain_community.document_loaders import WebBaseLoader

def web_side_load_chunk(query,text_splitter=text_splitter):
    data = WebBaseLoader(query).load_and_split()
    data = text_splitter.split_documents(data)
    return data
    


# ------------------- it will return the chunked_data-sets -------------
file_load_types = {
    "text/csv": lambda path: csv_load_chunk(path),
    "application/pdf": lambda path: pdf_load_chunk(path),
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": lambda path: docx_load_chunk(path),
    "application/vnd.openxmlformats-officedocument.presentationml.presentation": lambda path: pptx_load_and_chunk(path)
}

# ---------------------------------------------------------------load the document and chunked----------------------------------------


#           -----------------------------------------------






