
import sys
import json
import importlib.util

# Загружаем модуль aiService
spec = importlib.util.spec_from_file_location("aiService", "api/aiService.py")
aiService = importlib.util.module_from_spec(spec)
spec.loader.exec_module(aiService)

# Создаем экземпляр сервиса
ai_service = aiService.AiChatService()

def main():
    # Получаем аргументы командной строки
    if len(sys.argv) < 3:
        print(json.dumps({"error": "Missing arguments: endpoint and data"}))
        sys.exit(1)
    
    endpoint = sys.argv[1]
    data_json = sys.argv[2]
    
    try:
        # Парсим JSON-данные
        data = json.loads(data_json)
        
        # Вызываем соответствующий метод в зависимости от эндпоинта
        if endpoint == "chat":
            response = ai_service.generate_response(
                user_message=data.get("message", ""),
                chat_history=data.get("history", [])
            )
            print(json.dumps({"response": response}))
        
        elif endpoint == "recommendations":
            recommendations = ai_service.generate_recommendations(data.get("userData", {}))
            print(json.dumps({"recommendations": recommendations}))
        
        else:
            print(json.dumps({"error": f"Unknown endpoint: {endpoint}"}))
            sys.exit(1)
    
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)

if __name__ == "__main__":
    main()
  