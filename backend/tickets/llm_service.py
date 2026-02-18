import os
import json
import logging
import requests
from typing import Tuple

logger = logging.getLogger(__name__)

class LLMService:
    def __init__(self):
        self.api_key = os.getenv('LLM_API_KEY', '')
        self.provider = os.getenv('LLM_PROVIDER', 'openai')

    def classify_ticket(self, description: str) -> Tuple[str, str]:
        """
        Classify ticket description and return (category, priority)
        Returns defaults if LLM fails
        """
        if not self.api_key:
            logger.warning("LLM_API_KEY not set, using defaults")
            return ('general', 'medium')

        try:
            # Normalize provider to lowercase for comparison
            provider = self.provider.lower() if self.provider else 'openai'
            
            if provider == 'openai':
                return self._classify_openai(description)
            elif provider == 'anthropic':
                return self._classify_anthropic(description)
            elif provider == 'gemini' or provider == 'google':
                return self._classify_gemini(description)
            else:
                logger.warning(f"Unknown LLM provider: {self.provider}")
                return ('general', 'medium')
        except Exception as e:
            logger.error(f"LLM classification failed: {str(e)}")
            return ('general', 'medium')

    def _classify_openai(self, description: str) -> Tuple[str, str]:
        """Use OpenAI API for classification"""
        try:
            import openai
            openai.api_key = self.api_key

            prompt = f"""Analyze this support ticket description and classify it.

Description: {description}

Respond with ONLY a JSON object (no markdown, no extra text):
{{"category": "billing|technical|account|general", "priority": "low|medium|high|critical"}}

Guidelines:
- billing: Payment, invoicing, subscription issues
- technical: Software bugs, feature requests, technical issues
- account: Profile, password, access issues
- general: Other questions
- priority: Critical if urgent/blocking, High if important, Medium if normal, Low if minor
"""

            response = openai.ChatCompletion.create(
                model="gpt-3.5-turbo",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.3,
                max_tokens=100
            )

            result_text = response.choices[0].message.content.strip()
            result = json.loads(result_text)
            
            category = result.get('category', 'general')
            priority = result.get('priority', 'medium')
            
            if category not in ['billing', 'technical', 'account', 'general']:
                category = 'general'
            if priority not in ['low', 'medium', 'high', 'critical']:
                priority = 'medium'
                
            return (category, priority)
        except Exception as e:
            logger.error(f"OpenAI error: {str(e)}")
            raise

    def _classify_anthropic(self, description: str) -> Tuple[str, str]:
        """Use Anthropic REST API for classification (avoiding SDK issues)"""
        try:
            prompt = f"""Analyze this support ticket description and classify it.

Description: {description}

Respond with ONLY a JSON object (no markdown, no extra text):
{{"category": "billing|technical|account|general", "priority": "low|medium|high|critical"}}

Guidelines:
- billing: Payment, invoicing, subscription issues
- technical: Software bugs, feature requests, technical issues
- account: Profile, password, access issues
- general: Other questions
- priority: Critical if urgent/blocking, High if important, Medium if normal, Low if minor
"""

            headers = {
                "x-api-key": self.api_key,
                "anthropic-version": "2023-06-01",
                "content-type": "application/json",
            }

            payload = {
                "model": "claude-haiku-3-20240307",
                "max_tokens": 100,
                "messages": [
                    {"role": "user", "content": prompt}
                ]
            }

            response = requests.post(
                "https://api.anthropic.com/v1/messages",
                headers=headers,
                json=payload,
                timeout=10
            )
            
            if response.status_code != 200:
                error_msg = f"Anthropic API error: Status {response.status_code}, Response: {response.text}"
                logger.error(error_msg)
                print(f"!!! {error_msg} !!!", flush=True)
                response.raise_for_status()
                
            data = response.json()
            
            result_text = data["content"][0]["text"].strip()
            result = json.loads(result_text)
            
            category = result.get('category', 'general')
            priority = result.get('priority', 'medium')
            
            if category not in ['billing', 'technical', 'account', 'general']:
                category = 'general'
            if priority not in ['low', 'medium', 'high', 'critical']:
                priority = 'medium'
                
            logger.info(f"Anthropic classification: category={category}, priority={priority}")
            return (category, priority)
        except Exception as e:
            logger.error(f"Anthropic error: {str(e)}")
            raise

    def _classify_gemini(self, description: str) -> Tuple[str, str]:
        """Use Google Gemini API for classification (free tier available)"""
        try:
            import google.generativeai as genai
            
            genai.configure(api_key=self.api_key)
            model = genai.GenerativeModel('gemini-1.5-flash')
            
            prompt = f"""Analyze this support ticket description and classify it.

Description: {description}

Respond with ONLY a JSON object (no markdown, no extra text):
{{"category": "billing|technical|account|general", "priority": "low|medium|high|critical"}}

Guidelines:
- billing: Payment, invoicing, subscription issues
- technical: Software bugs, feature requests, technical issues
- account: Profile, password, access issues
- general: Other questions
- priority: Critical if urgent/blocking, High if important, Medium if normal, Low if minor
"""

            response = model.generate_content(prompt)
            result_text = response.text.strip()
            
            # Try to extract JSON from response (in case it includes markdown)
            if '```' in result_text:
                result_text = result_text.split('```')[1]
                if result_text.startswith('json'):
                    result_text = result_text[4:]
            
            result = json.loads(result_text)
            
            category = result.get('category', 'general')
            priority = result.get('priority', 'medium')
            
            if category not in ['billing', 'technical', 'account', 'general']:
                category = 'general'
            if priority not in ['low', 'medium', 'high', 'critical']:
                priority = 'medium'
                
            logger.info(f"Gemini classification: category={category}, priority={priority}")
            return (category, priority)
        except Exception as e:
            logger.error(f"Gemini error: {str(e)}")
            raise


