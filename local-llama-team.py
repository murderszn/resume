from autogen import AssistantAgent, UserProxyAgent

config_list = [{
    "api_type": "open_ai",
    "base_url": "http://127.0.0.1:1234",
    "api_key": "NULL"
}]

llm_config = {
    "seed": 42,
    "config_list": config_list,
    "temperature": 0,
    "model": "llama-3.2-1b-instruct"
}

assistant = AssistantAgent("assistant", llm_config=llm_config)
user_proxy = UserProxyAgent("user_proxy", code_execution_config=False)

# Start the chat
user_proxy.initiate_chat(
    assistant,
    message="Tell me about Michael Jordan.",
)
