import React from 'react';
import { useTranslation } from 'react-i18next';
import { Bot, Sparkles, Clock, ArrowLeft } from 'lucide-react';

const Assistant: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-off-white">
      {/* Header */}
      <div className="bg-white border-b border-light-gray">
        <div className="container mx-auto px-4 py-6">
          <a
            href="/dashboard"
            className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-gray text-white hover:bg-dark-blue rounded-lg font-medium transition-all duration-200 mb-4 shadow-md"
          >
            <ArrowLeft size={20} />
            <span>{t('assistant.back')}</span>
          </a>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-dark-blue">
                {t('assistant.title')}
              </h1>
              <p className="text-metallic-gray mt-1">
                {t('assistant.subtitle')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          {/* Card principale */}
          <div className="card text-center">
            {/* Icône animée */}
            <div className="mb-8">
              <div className="relative inline-block">
                <div className="w-32 h-32 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto">
                  <Bot className="text-blue-gray" size={64} />
                </div>
                <div className="absolute -top-2 -right-2">
                  <Sparkles className="text-yellow-500" size={32} />
                </div>
              </div>
            </div>

            {/* Titre */}
            <h2 className="text-3xl font-bold text-dark-blue mb-4">
              {t('assistant.comingSoon')}
            </h2>

            {/* Description */}
            <p className="text-lg text-metallic-gray mb-8 max-w-xl mx-auto">
              {t('assistant.description')}
            </p>

            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 text-left">
              <div className="bg-blue-50 rounded-lg p-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Bot className="text-blue-600" size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-dark-blue mb-2">
                      {t('assistant.feature1Title')}
                    </h3>
                    <p className="text-sm text-metallic-gray">
                      {t('assistant.feature1Description')}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-purple-50 rounded-lg p-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Sparkles className="text-purple-600" size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-dark-blue mb-2">
                      {t('assistant.feature2Title')}
                    </h3>
                    <p className="text-sm text-metallic-gray">
                      {t('assistant.feature2Description')}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 rounded-lg p-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Clock className="text-lime-green" size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-dark-blue mb-2">
                      {t('assistant.feature3Title')}
                    </h3>
                    <p className="text-sm text-metallic-gray">
                      {t('assistant.feature3Description')}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-orange-50 rounded-lg p-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Bot className="text-orange-600" size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-dark-blue mb-2">
                      {t('assistant.feature4Title')}
                    </h3>
                    <p className="text-sm text-metallic-gray">
                      {t('assistant.feature4Description')}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="bg-yellow-50 border-l-4 border-yellow-500 rounded-lg p-6 text-left">
              <div className="flex items-start space-x-4">
                <Clock className="text-yellow-600 flex-shrink-0 mt-1" size={24} />
                <div>
                  <h3 className="font-semibold text-dark-blue mb-2">
                    {t('assistant.statusTitle')}
                  </h3>
                  <p className="text-metallic-gray">
                    {t('assistant.statusDescription')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Assistant;
