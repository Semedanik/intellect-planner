import json
import logging
from flask import Blueprint, request, jsonify
from ..aiService import AiChatService

# Настройка логирования
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger('AiRoutes')

# Инициализация Blueprint для API маршрутов нейропомощника
ai_routes = Blueprint('ai_routes', __name__)

# Инициализация сервиса AI
ai_service = AiChatService()

@ai_routes.route('/chat', methods=['POST'])
def chat():
    """
    Маршрут для обработки запросов чата с нейропомощником
    
    Ожидает JSON:
    {
        "userId": 123,
        "message": "Текст сообщения",
        "sessionId": "uuid4-session-id",
        "history": [] (опционально)
    }
    
    Возвращает:
    {
        "response": "Ответ от нейропомощника",
        "userId": 123,
        "sessionId": "uuid4-session-id"
    }
    """
    try:
        data = request.get_json()
        
        # Проверка обязательных полей
        if not all(key in data for key in ['userId', 'message', 'sessionId']):
            return jsonify({
                'error': 'Missing required fields: userId, message, sessionId'
            }), 400
        
        # Извлечение данных из запроса
        user_id = data.get('userId')
        user_message = data.get('message')
        session_id = data.get('sessionId')
        chat_history = data.get('history', [])
        
        logger.info(f"Chat request received from user {user_id}, session {session_id}")
        
        # Генерация ответа
        response = ai_service.generate_response(
            user_message=user_message,
            chat_history=chat_history
        )
        
        return jsonify({
            'response': response,
            'userId': user_id,
            'sessionId': session_id
        })
        
    except Exception as e:
        logger.error(f"Error in chat endpoint: {str(e)}")
        return jsonify({
            'error': f'Error processing request: {str(e)}'
        }), 500

@ai_routes.route('/recommendations', methods=['POST'])
def recommendations():
    """
    Маршрут для генерации персонализированных рекомендаций
    
    Ожидает JSON:
    {
        "userId": 123,
        "userData": {
            "tasks": [...],
            "stats": {...},
            "preferences": {...}
        }
    }
    
    Возвращает:
    {
        "recommendations": ["рекомендация 1", "рекомендация 2", "рекомендация 3"],
        "userId": 123
    }
    """
    try:
        data = request.get_json()
        
        # Проверка обязательных полей
        if not all(key in data for key in ['userId', 'userData']):
            return jsonify({
                'error': 'Missing required fields: userId, userData'
            }), 400
        
        # Извлечение данных из запроса
        user_id = data.get('userId')
        user_data = data.get('userData', {})
        
        logger.info(f"Recommendations request received for user {user_id}")
        
        # Генерация рекомендаций
        recommendations = ai_service.generate_recommendations(user_data)
        
        return jsonify({
            'recommendations': recommendations,
            'userId': user_id
        })
        
    except Exception as e:
        logger.error(f"Error in recommendations endpoint: {str(e)}")
        return jsonify({
            'error': f'Error processing request: {str(e)}'
        }), 500

@ai_routes.route('/health', methods=['GET'])
def health_check():
    """Проверка работоспособности API нейропомощника"""
    return jsonify({
        'status': 'ok',
        'service': 'ai-service'
    }) 