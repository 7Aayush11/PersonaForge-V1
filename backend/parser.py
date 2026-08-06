from langchain_core.prompts import ChatPromptTemplate
from langchain_groq import ChatGroq
import dotenv
import json, os

dotenv.load_dotenv()


llm = ChatGroq(model="openai/gpt-oss-120b", api_key=os.getenv("GROQ_API_KEY"))
prompt = ChatPromptTemplate.from_messages([
    ("system", "You are a JSON expert and text formatter. Your task is to convert the raw resume text into proper json format. Ensure consistent formatting and a follow the below structure. Make sure everything is in json and only the data mentioned in the list is properly collected and converted into JSON format the list is as follows: [name, email, phone_number, location, linkedin, github, experience, project, skills, education, certification ].Experience should contain more objects for each experience all should include companyname, role, period, description. Projects should be an object and each project should include name, description, techstack. Skills should all be clubbed into one single array if skills are mentioned in differnet sections. Eduaction should follow contain institution, period, degree, grade, location. Ensure all the details are collected, and formatted in JSON if there is no such value use N/A. Ensure strict JSON, no additional text, no explanation"),
    ("user", "{text}")
])

def get_json(text: str):
    chain = prompt | llm
    
    try:
        response = chain.invoke(
            {"text": text}
        )
        
        return json.loads(response.content)
    except Exception as e:
        return (f"An error occurred {e}")