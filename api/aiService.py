import os
import json
import logging
from openai import OpenAI
from dotenv import load_dotenv

# Настройка логирования
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger('AiService')

# Загрузка переменных окружения из .env файла
load_dotenv()

# Ключ API OpenAI или другого провайдера
API_KEY = os.environ.get("OPENAI_API_KEY", "sk-or-vv-17e4b6d33262f00e71482b98dc5031e3e23df2406bee7ef9b81865394b864c54")
API_BASE_URL = os.environ.get("OPENAI_API_BASE_URL", "https://api.vsegpt.ru/v1")
DEFAULT_MODEL = os.environ.get("OPENAI_DEFAULT_MODEL", "google/gemini-2.0-flash-lite-001")
DEFAULT_TEMPERATURE = float(os.environ.get("OPENAI_DEFAULT_TEMPERATURE", "0.1"))

SYSTEM_PROMPT = """
Добрый день!
Ты - умный помощник

Тебе на вход будет сегодняшняя дата
Также, будет поступать расписание на сегодняшний день
Твоя задача будет проанализировать действия человека и дать ему рекомендации

Пример:
У человека в расписании на 16.04 4 пары, он возвращается в 16:30, однако сегодня он указал, что спал 4 часа
Ты знаешь, что норма сна - 8 часов
У человека на вечер 16.04 нет планов
Ты можешь предложить ему поспать N количество часов(Обращайся к базе знаний, смотри статьи, видео, рецензии для лучшего ответа)

Также, пользователь может указывать свои планы и задачи
Если в конкретный день они не помещаются, то предлагай альтернативу:
разбить на мелкие подзадачи, либо предложить другой день для выполнения заданий

Отвечай от имени МAIковский(именно так указывай)
Будь вежлив, краток, ответ должен быть на русском языке

Не торопись с ответом, это важно
"""

class AiChatService:
    """Сервис для взаимодействия с API нейропомощника"""
    
    def __init__(self, api_key=API_KEY, base_url=API_BASE_URL):
        """Инициализация клиента OpenAI"""
        self.client = OpenAI(
            api_key=api_key,
            base_url=base_url
        )
        logger.info("AI Chat service initialized")
    
    def generate_response(self, 
                          user_message, 
                          chat_history=None, 
                          model=DEFAULT_MODEL,
                          temperature=DEFAULT_TEMPERATURE):
        """
        Генерирует ответ на сообщение пользователя с учетом истории чата
        
        Args:
            user_message (str): Сообщение пользователя
            chat_history (list, optional): История чата в формате списка dict {"role": ..., "content": ...}
            model (str, optional): Модель для генерации ответа
            temperature (float, optional): Температура генерации ответа (0.0 - 1.0)
            
        Returns:
            str: Ответ модели
        """
        try:
            # Подготовка сообщений для запроса
            messages = [{"role": "system", "content": SYSTEM_PROMPT}]
            
            # Добавляем историю чата, если она предоставлена
            if chat_history and isinstance(chat_history, list):
                messages.extend(chat_history)
            
            # Добавляем текущее сообщение пользователя
            messages.append({"role": "user", "content": user_message})
            
            logger.info(f"Sending request to AI model {model}")
            
            # Выполняем запрос к API
            completion = self.client.chat.completions.create(
                model=model,
                messages=messages,
                temperature=temperature
            )
            
            # Извлекаем ответ модели
            answer = completion.choices[0].message.content
            
            logger.info("AI response generated successfully")
            return answer
            
        except Exception as e:
            logger.error(f"Error generating AI response: {str(e)}")
            return f"Извините, произошла ошибка при обработке запроса: {str(e)}"
    
    def generate_recommendations(self, user_data):
        """
        Генерирует персонализированные рекомендации на основе данных пользователя
        
        Args:
            user_data (dict): Словарь с данными о пользователе и его задачах
                Пример: {
                    "tasks": [{"title": "...", "priority": "...", "dueDate": "..."}],
                    "stats": {"productivity": 75, "completedToday": 3},
                    "preferences": {"studyTime": "morning"}
                }
                
        Returns:
            list: Список рекомендаций
        """
        try:
            # Создаем запрос для генерации рекомендаций
            prompt = f"""
            На основе этих данных о пользователе, сгенерируй 3 конкретные рекомендации 
            для повышения продуктивности и эффективности обучения.
            Данные пользователя: {json.dumps(user_data, ensure_ascii=False)}
            
            Рекомендации должны быть конкретными, действенными и учитывать текущие задачи и статистику пользователя.
            Каждая рекомендация должна содержать: 1) что сделать, 2) когда сделать, 3) как именно это поможет.
            """
            
            # Запрос к API
            completion = self.client.chat.completions.create(
                model=DEFAULT_MODEL,
                messages=[
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3
            )
            
            # Обрабатываем ответ и разбиваем его на отдельные рекомендации
            response = completion.choices[0].message.content
            recommendations = []
            
            # Разбираем текст на отдельные рекомендации
            for line in response.split('\n'):
                if line.strip() and (line.strip().startswith('-') or line.strip()[0].isdigit()):
                    clean_line = line.strip().lstrip('-').lstrip('1234567890.').strip()
                    if clean_line:
                        recommendations.append(clean_line)
            
            # Если не удалось разбить ответ, используем весь текст как одну рекомендацию
            if not recommendations and response.strip():
                recommendations = [response.strip()]
                
            # Ограничиваем до 3 рекомендаций
            recommendations = recommendations[:3]
            
            logger.info(f"Generated {len(recommendations)} recommendations")
            return recommendations
            
        except Exception as e:
            logger.error(f"Error generating recommendations: {str(e)}")
            return [
                "Выделить 2 часа сегодня на подготовку к экзамену по математике",
                "Разбить проект по программированию на 3 части для более эффективной работы",
                "Перенести чтение литературы на выходные для лучшей концентрации"
            ]

# Пример использования
if __name__ == "__main__":
    ai_service = AiChatService()
    
    # Пример генерации ответа
    response = ai_service.generate_response("Как мне эффективно подготовиться к экзамену по математике?")
    print("Ответ на вопрос:", response)
    
    # Пример генерации рекомендаций
    sample_user_data = {
        "tasks": [
            {"title": "Подготовка к экзамену по математике", "priority": "high", "dueDate": "2025-12-20"},
            {"title": "Написание курсовой работы", "priority": "medium", "dueDate": "2025-12-15"},
            {"title": "Чтение литературы", "priority": "low", "dueDate": "2025-12-10"}
        ],
        "stats": {"productivity": 65, "completedToday": 2},
        "preferences": {"studyTime": "evening"}
    }
    
    recommendations = ai_service.generate_recommendations(sample_user_data)
    print("\nРекомендации:")
    for i, rec in enumerate(recommendations, 1):
        print(f"{i}. {rec}") 