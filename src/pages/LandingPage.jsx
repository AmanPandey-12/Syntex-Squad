import { Link } from 'react-router-dom';
import { useRef, useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import {
  motion, useScroll, useSpring, useTransform,
  AnimatePresence, useMotionValue, useAnimation
} from 'framer-motion';
import {
  ArrowRight, Leaf, ChevronDown, Heart, Cloud, BarChart3,
  MessageSquare, ShoppingCart, User, Package, FileText,
  Sprout, Scan, ArrowUpRight, Shield, Zap, MapPin,
  Calendar, Mail, Sun, Phone, Github, Linkedin, Globe
} from 'lucide-react';

/* ════════════════════════════════════════════
   LANGUAGE DATA — 6 languages, fully translated
════════════════════════════════════════════ */
const LANGS = {
  hi: {
    code: 'HI', label: 'हिंदी', flag: '🇮🇳',
    hero1: 'उगाएं', hero2: 'स्मार्ट।', hero3: 'बेहतर खेती, बेहतर जीवन।',
    heroSub: 'AI रोग पहचान, हाइपर-लोकल मौसम, मंडी भाव, किसान समुदाय और स्मार्ट सहायक — एक आधुनिक भारतीय किसान की सभी जरूरतें एक जगह।',
    launch: 'KrishiAI खोलें', seeFeatures: 'और देखें',
    tagline: 'AI-संचालित कृषि मंच',
    statsLabels: ['रोग पहचाने', 'AI सटीकता', 'मुख्य सुविधाएं'],
    featTitle: 'सब कुछ', featSpan: 'किसानों', featEnd: 'के लिए',
    howTitle: 'सिर्फ', howSpan: '३ कदम में',
    ctaTitle: 'जुड़ें', ctaSpan: 'KrishiAI से',
    ctaSub: 'पत्ती स्कैन से लेकर समुदाय तक — एक आधुनिक किसान की हर जरूरत यहाँ है, मुफ्त में शुरू करें।',
    ctaBtn: 'मुफ्त में शुरू करें',
    storyBadge: 'एक किसान की यात्रा, AI द्वारा संचालित',
    storyTitle: 'सूरज उगने से', storySpan: 'अस्त तक',
    storyDesc: 'रामू की कहानी — एक साधारण किसान जो KrishiAI के साथ असाधारण बना।',
    howUse: 'कैसे इस्तेमाल करें',
    footerTagline: 'उगाएं स्मार्ट। खेती बेहतर।',
    footerDesc: 'भारतीय किसानों के लिए AI-संचालित खेती सहायक। फसल रोग पहचानें, बाजार भाव ट्रैक करें, और आत्मविश्वास के साथ खेती करें।',
    madeWith: 'भारतीय किसानों के लिए प्यार से बनाया',
    quickLinks: 'त्वरित लिंक', company: 'कंपनी', contact: 'संपर्क',
    allRights: 'सर्वाधिकार सुरक्षित',
    timeStory: [
      { time: '5:00 AM', title: 'भोर की जाँच', desc: 'रामू उठते हैं — खेत में ओस है, हवा ताज़ी है। वह KrishiAI खोलते हैं, आज का मौसम और मंडी भाव देखते हैं। AI बताता है — शाम को बारिश। योजना बदली।' },
      { time: '7:00 AM', title: 'फसल की स्कैनिंग', desc: 'गेहूँ की एक पत्ती पर धब्बे हैं। रामू फोटो खींचते हैं। 3 सेकंड — AI ने बता दिया: "पत्ती झुलसा रोग। उपचार: नीम का तेल।" रिपोर्ट सेव हो गई।' },
      { time: '11:00 AM', title: 'बरखा की चेतावनी', desc: 'AI ने अलर्ट भेजा — "दोपहर 3 बजे तेज बारिश संभव।" रामू ने समय पर कटी फसल छत के नीचे रखी। नुकसान बचा।' },
      { time: '3:00 PM', title: 'AI सलाहकार', desc: 'बरसात के बाद रामू AI Copilot से पूछते हैं — "अगली फसल क्या बोऊँ?" AI ने मिट्टी, मौसम और बाजार देखकर सुझाव दिया: सरसों।' },
      { time: '7:00 PM', title: 'रिपोर्ट और आराम', desc: 'दिन की सारी स्कैन रिपोर्ट PDF में डाउनलोड। कृषि अधिकारी को भेजी। रामू संतुष्ट हैं — KrishiAI उनका साथी है।' },
    ],
  },
  en: {
    code: 'EN', label: 'English', flag: '🇬🇧',
    hero1: 'GROW', hero2: 'SMARTER.', hero3: 'Better Farming, Better Life.',
    heroSub: 'AI disease detection, hyper-local weather, live Mandi prices, farmer community, and a smart copilot — everything a modern Indian farmer needs, in one platform.',
    launch: 'Launch KrishiAI', seeFeatures: 'See Features',
    tagline: 'AI-Powered Agriculture Platform',
    statsLabels: ['Diseases Detected', 'AI Accuracy', 'Core Features'],
    featTitle: 'Everything', featSpan: 'Farmers', featEnd: 'Need',
    howTitle: 'Up in', howSpan: '3 Steps',
    ctaTitle: 'Join', ctaSpan: 'KrishiAI',
    ctaSub: 'From leaf scanning to community networking — everything a modern farmer needs is here, free to get started.',
    ctaBtn: 'Get Started Free',
    storyBadge: "A farmer's journey, powered by AI",
    storyTitle: 'From Dawn', storySpan: 'to Dusk',
    storyDesc: "Ramu's story — an ordinary farmer who became extraordinary with KrishiAI.",
    howUse: 'How to use it',
    footerTagline: 'Grow Smarter. Cultivate Better.',
    footerDesc: 'AI-powered farming assistant built for Indian farmers. Detect crop diseases, track markets, and grow with confidence.',
    madeWith: 'Made with love for Indian Farmers',
    quickLinks: 'Quick Links', company: 'Company', contact: 'Contact',
    allRights: 'All rights reserved',
    timeStory: [
      { time: '5:00 AM', title: 'Morning Check', desc: 'Ramu wakes before sunrise — dew on the fields, fresh morning air. He opens KrishiAI, checks today\'s weather forecast and live Mandi prices. AI says: rain in the evening. He adjusts his plan.' },
      { time: '7:00 AM', title: 'Crop Scanning', desc: 'Spots on a wheat leaf. Ramu photographs it. 3 seconds — AI responds: "Leaf blight detected. Treatment: Neem oil spray." The report is saved to his inventory.' },
      { time: '11:00 AM', title: 'Rain Alert', desc: 'AI sends an alert — "Heavy rain expected at 3 PM." Ramu quickly moves harvested crops under shelter. Damage avoided, losses prevented.' },
      { time: '3:00 PM', title: 'AI Copilot Chat', desc: 'After the rain, Ramu asks the AI Copilot: "What should I sow next?" AI analyzes soil data, weather patterns, and market trends — recommends mustard.' },
      { time: '7:00 PM', title: 'Report & Rest', desc: 'All day\'s scan reports downloaded as PDF and sent to the agriculture officer. Ramu is satisfied — KrishiAI is his trusted companion.' },
    ],
  },
  ta: {
    code: 'TA', label: 'தமிழ்', flag: '🌴',
    hero1: 'வளர்க்கவும்', hero2: 'புத்திசாலியாக।', hero3: 'சிறந்த விவசாயம், சிறந்த வாழ்க்கை.',
    heroSub: 'AI நோய் கண்டறிதல், உள்ளூர் வானிலை, மண்டி விலை, விவசாயி சமூகம் மற்றும் AI உதவியாளர் — நவீன இந்திய விவசாயிக்கு தேவையான அனைத்தும்.',
    launch: 'KrishiAI திற', seeFeatures: 'மேலும் காண',
    tagline: 'AI-இயங்கும் விவசாய தளம்',
    statsLabels: ['நோய்கள் கண்டறியப்பட்டன', 'AI துல்லியம்', 'முக்கிய அம்சங்கள்'],
    featTitle: 'அனைத்தும்', featSpan: 'விவசாயிகளுக்கு', featEnd: 'தேவை',
    howTitle: 'வெறும்', howSpan: '3 படிகளில்',
    ctaTitle: 'சேரும்', ctaSpan: 'KrishiAI',
    ctaSub: 'இலை ஸ்கேன் முதல் சமூக நெட்வொர்க் வரை — நவீன விவசாயிக்கு தேவையான அனைத்தும் இங்கே.',
    ctaBtn: 'இலவசமாக தொடங்கும்',
    storyBadge: 'ஒரு விவசாயியின் பயணம், AI மூலம்',
    storyTitle: 'விடியல் முதல்', storySpan: 'மாலை வரை',
    storyDesc: 'ராமுவின் கதை — KrishiAI உடன் சாதாரண விவசாயி சாதனை படைத்தார்.',
    howUse: 'எவ்வாறு பயன்படுத்துவது',
    footerTagline: 'புத்திசாலியாக வளர்க்கவும்.',
    footerDesc: 'இந்திய விவசாயிகளுக்காக உருவாக்கப்பட்ட AI-இயங்கும் விவசாய உதவியாளர்.',
    madeWith: 'இந்திய விவசாயிகளுக்காக அன்புடன் உருவாக்கப்பட்டது',
    quickLinks: 'விரைவு இணைப்புகள்', company: 'நிறுவனம்', contact: 'தொடர்பு',
    allRights: 'அனைத்து உரிமைகளும் பாதுகாக்கப்பட்டவை',
    timeStory: [
      { time: '5:00 AM', title: 'காலை சோதனை', desc: 'ராமு சூரியோதயத்திற்கு முன் எழுகிறார். KrishiAI திறந்து இன்றைய வானிலை மற்றும் மண்டி விலைகளை சரிபார்க்கிறார். AI கூறுகிறது: மாலையில் மழை.' },
      { time: '7:00 AM', title: 'பயிர் ஸ்கேனிங்', desc: 'கோதுமை இலையில் புள்ளிகள். ராமு புகைப்படம் எடுக்கிறார். 3 விநாடிகளில் AI: "இலை கருகல் நோய். சிகிச்சை: வேப்ப எண்ணெய்." அறிக்கை சேமிக்கப்பட்டது.' },
      { time: '11:00 AM', title: 'மழை எச்சரிக்கை', desc: 'AI எச்சரிக்கை அனுப்புகிறது — "மதியம் 3 மணிக்கு கனமழை." ராமு அறுவடை செய்த பயிர்களை சேமித்தார். இழப்பு தவிர்க்கப்பட்டது.' },
      { time: '3:00 PM', title: 'AI ஆலோசனை', desc: 'மழைக்குப் பிறகு AI Copilot கேட்கிறார்: "அடுத்து என்ன விதைக்கணும்?" AI மண், வானிலை, சந்தை பகுப்பாய்வு — கடுகு பரிந்துரை.' },
      { time: '7:00 PM', title: 'அறிக்கை மற்றும் ஓய்வு', desc: 'அன்றைய ஸ்கேன் அறிக்கைகள் PDF ஆக பதிவிறக்கம். கிராம அதிகாரிக்கு அனுப்பப்பட்டது. KrishiAI நம்பகமான நண்பன்.' },
    ],
  },
  te: {
    code: 'TE', label: 'తెలుగు', flag: '🌾',
    hero1: 'పెంచండి', hero2: 'స్మార్ట్‌గా।', hero3: 'మెరుగైన వ్యవసాయం, మెరుగైన జీవితం.',
    heroSub: 'AI వ్యాధి నిర్ధారణ, స్థానిక వాతావరణం, మండి ధరలు, రైతు సమాజం మరియు AI సహాయకుడు — ఆధునిక భారతీయ రైతుకు అన్నీ ఒక చోట.',
    launch: 'KrishiAI తెరువు', seeFeatures: 'మరిన్ని చూడు',
    tagline: 'AI-ఆధారిత వ్యవసాయ వేదిక',
    statsLabels: ['వ్యాధులు గుర్తించబడ్డాయి', 'AI ఖచ్చితత్వం', 'ముఖ్య లక్షణాలు'],
    featTitle: 'అన్నీ', featSpan: 'రైతులకు', featEnd: 'అవసరం',
    howTitle: 'కేవలం', howSpan: '3 అడుగులు',
    ctaTitle: 'చేరండి', ctaSpan: 'KrishiAI',
    ctaSub: 'ఆకు స్కానింగ్ నుండి సమాజ నెట్‌వర్కింగ్ వరకు — ఆధునిక రైతుకు అన్నీ ఇక్కడే.',
    ctaBtn: 'ఉచితంగా ప్రారంభించు',
    storyBadge: 'ఒక రైతు ప్రయాణం, AI చేత నడిచే',
    storyTitle: 'తెల్లవారు నుండి', storySpan: 'సాయంత్రం వరకు',
    storyDesc: 'రాముడి కథ — KrishiAI తో సాధారణ రైతు అసాధారణ అయ్యాడు.',
    howUse: 'ఎలా ఉపయోగించాలి',
    footerTagline: 'స్మార్ట్‌గా పెంచండి. మెరుగ్గా సాగు చేయండి.',
    footerDesc: 'భారతీయ రైతులకు నిర్మించబడిన AI-ఆధారిత వ్యవసాయ సహాయకుడు.',
    madeWith: 'భారతీయ రైతుల కోసం ప్రేమతో నిర్మించబడింది',
    quickLinks: 'త్వరిత లింక్‌లు', company: 'కంపెనీ', contact: 'సంప్రదించండి',
    allRights: 'అన్ని హక్కులూ రక్షించబడ్డాయి',
    timeStory: [
      { time: '5:00 AM', title: 'తెల్లవారు తనిఖీ', desc: 'రాముడు సూర్యోదయానికి ముందే లేస్తాడు. KrishiAI తెరిచి నేటి వాతావరణం మరియు మండి ధరలు చూస్తాడు. AI చెప్తుంది: సాయంత్రం వర్షం.' },
      { time: '7:00 AM', title: 'పంట స్కానింగ్', desc: 'గోధుమ ఆకుపై మచ్చలు. రాముడు ఫోటో తీస్తాడు. 3 సెకన్లలో AI: "ఆకు తెగులు వ్యాధి. చికిత్స: వేప నూనె." నివేదిక సేవ్ అయింది.' },
      { time: '11:00 AM', title: 'వర్షం హెచ్చరిక', desc: 'AI హెచ్చరిక పంపింది — "మధ్యాహ్నం 3కి భారీ వర్షం." రాముడు కోసిన పంటలను ఆశ్రయంలో పెట్టాడు. నష్టం నివారించబడింది.' },
      { time: '3:00 PM', title: 'AI సలహాదారు', desc: 'వర్షం తర్వాత AI Copilot అడుగుతాడు: "తర్వాత ఏమి విత్తనం?" AI మట్టి, వాతావరణం, మార్కెట్ విశ్లేషించి — ఆవాలు సిఫారసు చేసింది.' },
      { time: '7:00 PM', title: 'నివేదిక మరియు విశ్రాంతి', desc: 'రోజంతటి స్కాన్ నివేదికలు PDF గా డౌన్‌లోడ్. వ్యవసాయ అధికారికి పంపబడింది. KrishiAI నమ్మకమైన తోడు.' },
    ],
  },
  bn: {
    code: 'BN', label: 'বাংলা', flag: '🌿',
    hero1: 'চাষ করুন', hero2: 'স্মার্টভাবে।', hero3: 'ভালো কৃষি, ভালো জীবন।',
    heroSub: 'AI রোগ শনাক্তকরণ, স্থানীয় আবহাওয়া, মান্ডি দাম, কৃষক সমাজ এবং AI সহকারী — আধুনিক ভারতীয় কৃষকের সব প্রয়োজন এক জায়গায়।',
    launch: 'KrishiAI খুলুন', seeFeatures: 'আরও দেখুন',
    tagline: 'AI-চালিত কৃষি প্ল্যাটফর্ম',
    statsLabels: ['রোগ শনাক্ত', 'AI নির্ভুলতা', 'মূল বৈশিষ্ট্য'],
    featTitle: 'সবকিছু', featSpan: 'কৃষকদের', featEnd: 'জন্য',
    howTitle: 'মাত্র', howSpan: '৩ ধাপে',
    ctaTitle: 'যোগ দিন', ctaSpan: 'KrishiAI-তে',
    ctaSub: 'পাতা স্ক্যানিং থেকে সম্প্রদায় নেটওয়ার্কিং — সব এখানে।',
    ctaBtn: 'বিনামূল্যে শুরু করুন',
    storyBadge: 'একজন কৃষকের যাত্রা, AI দ্বারা পরিচালিত',
    storyTitle: 'ভোর থেকে', storySpan: 'সন্ধ্যা পর্যন্ত',
    storyDesc: 'রামুর গল্প — KrishiAI-এর সাথে সাধারণ কৃষক অসাধারণ হলেন।',
    howUse: 'কীভাবে ব্যবহার করবেন',
    footerTagline: 'স্মার্টভাবে চাষ করুন।',
    footerDesc: 'ভারতীয় কৃষকদের জন্য AI-চালিত কৃষি সহকারী।',
    madeWith: 'ভারতীয় কৃষকদের জন্য ভালোবাসা দিয়ে তৈরি',
    quickLinks: 'দ্রুত লিঙ্ক', company: 'কোম্পানি', contact: 'যোগাযোগ',
    allRights: 'সর্বস্বত্ব সংরক্ষিত',
    timeStory: [
      { time: '5:00 AM', title: 'ভোরের পরীক্ষা', desc: 'রামু সূর্যোদয়ের আগেই ওঠেন। মাঠে শিশির, তাজা বাতাস। KrishiAI খুলে আজকের আবহাওয়া ও মান্ডি দাম দেখেন। AI বলে: সন্ধ্যায় বৃষ্টি।' },
      { time: '7:00 AM', title: 'ফসল স্ক্যানিং', desc: 'গমের পাতায় দাগ। রামু ছবি তোলেন। ৩ সেকেন্ডে AI: "পাতা পোড়া রোগ। চিকিৎসা: নিম তেল।" রিপোর্ট সেভ হয়ে গেল।' },
      { time: '11:00 AM', title: 'বৃষ্টির সতর্কতা', desc: 'AI সতর্কতা পাঠাল — "বিকেল ৩টায় ভারী বৃষ্টি।" রামু ফসল সরিয়ে নিলেন। ক্ষতি এড়ানো গেল।' },
      { time: '3:00 PM', title: 'AI পরামর্শ', desc: 'বৃষ্টির পর AI Copilot জিজ্ঞেস করেন: "পরে কী বুনব?" AI মাটি, আবহাওয়া, বাজার বিশ্লেষণ করে — সরিষার পরামর্শ দিল।' },
      { time: '7:00 PM', title: 'রিপোর্ট ও বিশ্রাম', desc: 'সারাদিনের স্ক্যান রিপোর্ট PDF হিসেবে ডাউনলোড। কৃষি অফিসারকে পাঠানো হলো। KrishiAI বিশ্বস্ত সঙ্গী।' },
    ],
  },
  mr: {
    code: 'MR', label: 'मराठी', flag: '🏵️',
    hero1: 'वाढवा', hero2: 'हुशारीने।', hero3: 'चांगली शेती, चांगलं आयुष्य।',
    heroSub: 'AI रोग ओळख, स्थानिक हवामान, मंडी भाव, शेतकरी समुदाय आणि AI सहाय्यक — आधुनिक भारतीय शेतकऱ्याच्या सर्व गरजा एका ठिकाणी.',
    launch: 'KrishiAI उघडा', seeFeatures: 'अधिक पाहा',
    tagline: 'AI-चालित कृषी व्यासपीठ',
    statsLabels: ['रोग ओळखले', 'AI अचूकता', 'मुख्य वैशिष्ट्ये'],
    featTitle: 'सर्व काही', featSpan: 'शेतकऱ्यांसाठी', featEnd: 'आवश्यक',
    howTitle: 'फक्त', howSpan: '३ पायऱ्यांमध्ये',
    ctaTitle: 'सामील व्हा', ctaSpan: 'KrishiAI मध्ये',
    ctaSub: 'पानाचे स्कॅनिंग ते समुदाय नेटवर्किंगपर्यंत — सर्व काही येथे.',
    ctaBtn: 'मोफत सुरू करा',
    storyBadge: 'एका शेतकऱ्याचा प्रवास, AI द्वारे संचालित',
    storyTitle: 'उगवतीपासून', storySpan: 'मावळतीपर्यंत',
    storyDesc: 'रामूची कथा — KrishiAI सोबत साधा शेतकरी असाधारण झाला.',
    howUse: 'कसे वापरावे',
    footerTagline: 'हुशारीने वाढवा. शेती सुधारा.',
    footerDesc: 'भारतीय शेतकऱ्यांसाठी बनवलेला AI-चालित शेती सहाय्यक.',
    madeWith: 'भारतीय शेतकऱ्यांसाठी प्रेमाने बनवलेले',
    quickLinks: 'द्रुत दुवे', company: 'कंपनी', contact: 'संपर्क',
    allRights: 'सर्व हक्क राखीव',
    timeStory: [
      { time: '5:00 AM', title: 'पहाटेची तपासणी', desc: 'रामू सूर्योदयापूर्वी उठतात. शेतात दव, ताजी हवा. KrishiAI उघडून आजचे हवामान आणि मंडी भाव बघतात. AI सांगतो: संध्याकाळी पाऊस.' },
      { time: '7:00 AM', title: 'पीक स्कॅनिंग', desc: 'गव्हाच्या पानावर डाग. रामू फोटो काढतात. ३ सेकंदात AI: "पान करपा रोग. उपाय: कडुनिंबाचे तेल." अहवाल सेव झाला.' },
      { time: '11:00 AM', title: 'पाऊस इशारा', desc: 'AI इशारा पाठवतो — "दुपारी ३ वाजता मुसळधार पाऊस." रामूंनी कापणी केलेले पीक छताखाली नेले. नुकसान टळले.' },
      { time: '3:00 PM', title: 'AI सल्लागार', desc: 'पावसानंतर AI Copilot ला विचारतात: "पुढे काय पेरू?" AI माती, हवामान, बाजार तपासून — मोहरी सुचवतो.' },
      { time: '7:00 PM', title: 'अहवाल आणि विश्रांती', desc: 'दिवसभराचे स्कॅन अहवाल PDF मध्ये डाउनलोड. कृषी अधिकाऱ्याला पाठवले. KrishiAI विश्वासू साथीदार.' },
    ],
  },
};

/* ════════════════════════════════════════════
   NATURE SCENE COMPONENTS
════════════════════════════════════════════ */

// Global Space Background
const SpaceStars = () => {
  const [stars] = useState(() => Array.from({ length: 200 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    size: Math.random() * 2 + 0.5,
    duration: Math.random() * 50 + 20,
    delay: Math.random() * -50,
    opacity: Math.random() * 0.6 + 0.1
  })));

  // Shooting stars
  const [shootingStars] = useState(() => Array.from({ length: 8 }, (_, i) => ({
    id: `sh-${i}`,
    top: Math.random() * 70,
    duration: Math.random() * 3 + 1.5,
    delay: Math.random() * 15 + i * 2,
  })));

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" style={{ background: '#030508' }}>
      {/* Deep space glow */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-900/10 blur-[150px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-emerald-900/10 blur-[150px] rounded-full" />

      {stars.map((star) => (
        <motion.div
          key={star.id}
          className="absolute rounded-full bg-white"
          style={{
            left: `${star.left}%`,
            width: star.size,
            height: star.size,
            opacity: star.opacity,
            boxShadow: `0 0 ${star.size * 2}px rgba(255,255,255,0.8)`
          }}
          initial={{ top: '100%' }}
          animate={{ top: '-10%' }}
          transition={{ duration: star.duration, delay: star.delay, repeat: Infinity, ease: 'linear' }}
        />
      ))}
      {shootingStars.map((s) => (
        <motion.div
          key={s.id}
          className="absolute h-[1px] bg-gradient-to-r from-transparent via-white to-transparent"
          style={{
            top: `${s.top}%`,
            width: '150px',
            opacity: 0,
            transform: 'rotate(-45deg)'
          }}
          animate={{
            left: ['100%', '-20%'],
            opacity: [0, 1, 1, 0]
          }}
          transition={{ duration: s.duration, delay: s.delay, repeat: Infinity, ease: 'linear', repeatDelay: Math.random() * 10 + 5 }}
        />
      ))}
    </div>
  );
};

// Rising moon / pre-dawn crescent
const Moon = () => (
  <div className="absolute top-14 left-16 pointer-events-none" style={{ zIndex: 2 }}>
    <motion.div
      animate={{ y: [0, -8, 0], opacity: [0.6, 0.8, 0.6] }}
      transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
    >
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
        <path d="M36 24C36 30.627 30.627 36 24 36C17.373 36 12 30.627 12 24C12 17.373 17.373 12 24 12C20.686 15.314 20 19 20 24C20 29 22.686 32.686 26 36C31.314 36 36 30.627 36 24Z"
          fill="rgba(254,243,199,0.25)" />
        <circle cx="24" cy="24" r="10" fill="none" stroke="rgba(254,243,199,0.15)" strokeWidth="1" />
      </svg>
    </motion.div>
  </div>
);

// Advanced sun with rays, corona, lens flare
const AdvancedSun = ({ phase = 'dawn' }) => {
  const sunColor = phase === 'dawn' ? '#f97316' : phase === 'morning' ? '#fbbf24' : '#fef08a';
  const glowColor = phase === 'dawn' ? 'rgba(249,115,22,0.4)' : 'rgba(251,191,36,0.5)';
  return (
    <div className="absolute pointer-events-none" style={{
      right: phase === 'dawn' ? '18%' : '12%',
      top: phase === 'dawn' ? '62%' : '12%',
      zIndex: 2,
      transform: 'translate(50%, -50%)',
    }}>
      {/* Outer glow corona */}
      <motion.div className="absolute rounded-full"
        style={{ inset: -40, background: `radial-gradient(circle, ${glowColor}, transparent 70%)` }}
        animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
      />
      {/* Rotating rays */}
      <motion.div className="relative w-24 h-24"
        animate={{ rotate: 360 }}
        transition={{ duration: 80, repeat: Infinity, ease: 'linear' }}>
        {Array.from({ length: 16 }, (_, i) => (
          <div key={i} className="absolute left-1/2 top-1/2 origin-bottom"
            style={{
              width: i % 2 === 0 ? 1.5 : 1,
              height: i % 2 === 0 ? 28 : 18,
              marginLeft: i % 2 === 0 ? -0.75 : -0.5,
              background: `linear-gradient(to top, ${sunColor}, transparent)`,
              transform: `rotate(${i * 22.5}deg) translateY(-200%)`,
              opacity: i % 2 === 0 ? 0.5 : 0.25,
              borderRadius: 2,
            }}
          />
        ))}
        {/* Sun disk */}
        <motion.div className="absolute inset-6 rounded-full"
          style={{ background: `radial-gradient(circle at 40% 40%, #fff8dc, ${sunColor}, ${phase === 'dawn' ? '#c2410c' : '#d97706'})` }}
          animate={{ scale: [1, 1.04, 1] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        />
      </motion.div>
    </div>
  );
};

// Horizon gradient glow
const HorizonGlow = ({ phase = 'dawn' }) => {
  const colors = {
    dawn: 'linear-gradient(to top, rgba(234,88,12,0.45) 0%, rgba(251,146,60,0.25) 25%, rgba(49,46,129,0.1) 60%, transparent 100%)',
    morning: 'linear-gradient(to top, rgba(22,163,74,0.35) 0%, rgba(21,128,61,0.15) 40%, transparent 100%)',
    noon: 'linear-gradient(to top, rgba(22,163,74,0.2) 0%, transparent 60%)',
    evening: 'linear-gradient(to top, rgba(234,88,12,0.3) 0%, rgba(251,191,36,0.15) 30%, transparent 100%)',
  };
  return (
    <div className="absolute bottom-0 left-0 right-0 h-64 pointer-events-none"
      style={{ background: colors[phase] || colors.dawn, zIndex: 3 }} />
  );
};

// Advanced rain — smooth, layered, wind-driven
const AdvancedRain = () => {
  const layers = [
    { count: 25, speed: 1.2, angle: -12, opacity: 0.35, width: 1, lenMin: 18, lenMax: 32 },
    { count: 18, speed: 0.9, angle: -8, opacity: 0.2, width: 0.7, lenMin: 12, lenMax: 22 },
    { count: 12, speed: 1.6, angle: -15, opacity: 0.15, width: 1.2, lenMin: 22, lenMax: 40 },
  ];
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 4 }}>
      <svg className="absolute inset-0 w-full h-full" style={{ mixBlendMode: 'screen' }}>
        <defs>
          <filter id="rain-blur">
            <feGaussianBlur stdDeviation="0.3" />
          </filter>
        </defs>
        {layers.map((layer, li) =>
          Array.from({ length: layer.count }, (_, i) => {
            const x = Math.random() * 110 - 5;
            const delay = Math.random() * 2.5;
            const len = layer.lenMin + Math.random() * (layer.lenMax - layer.lenMin);
            const dur = layer.speed + Math.random() * 0.4;
            const dx = Math.tan((layer.angle * Math.PI) / 180) * 100;
            return (
              <motion.line key={`${li}-${i}`}
                x1={`${x}%`} y1="-2%"
                x2={`${x + dx * 0.08}%`} y2={`${len * 0.7}%`}
                stroke="#bae6fd"
                strokeWidth={layer.width}
                strokeOpacity={layer.opacity}
                filter="url(#rain-blur)"
                initial={{ y: '-110%' }}
                animate={{ y: '220%' }}
                transition={{ duration: dur, delay, repeat: Infinity, ease: 'linear', repeatDelay: 0 }}
              />
            );
          })
        )}
      </svg>
      {/* Mist overlay */}
      <motion.div className="absolute inset-0"
        style={{ background: 'linear-gradient(to bottom, transparent 0%, rgba(147,197,253,0.04) 40%, rgba(147,197,253,0.08) 100%)' }}
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  );
};

// Birds — realistic wing-beat simulation
const Birds = ({ count = 6 }) => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 5 }}>
      {Array.from({ length: count }, (_, i) => {
        const y = 6 + Math.random() * 22;
        const delay = i * 3.5;
        const scale = 0.5 + Math.random() * 0.7;
        const yDrift = (Math.random() - 0.5) * 20;
        return (
          <motion.div key={i} className="absolute"
            style={{ top: `${y}%`, left: '-8%' }}
            animate={{ x: ['0vw', '115vw'], y: [0, yDrift * 0.3, yDrift, yDrift * 0.3, 0] }}
            transition={{ x: { duration: 20 + i * 4, delay, repeat: Infinity, ease: 'linear' }, y: { duration: 6, delay, repeat: Infinity, ease: 'easeInOut' } }}
          >
            <motion.svg width={28 * scale} height={14 * scale} viewBox="0 0 28 14" fill="none"
              animate={{ scaleY: [1, 0.5, 1, 0.5, 1] }}
              transition={{ duration: 0.6, repeat: Infinity, ease: 'easeInOut' }}>
              <path d="M2 7 Q7 2 14 7 Q21 2 26 7" stroke="rgba(209,250,229,0.7)" strokeWidth="1.5" strokeLinecap="round" fill="none" />
            </motion.svg>
          </motion.div>
        );
      })}
    </div>
  );
};

// Advanced trees — multiple layers, parallax depth
const TreeLine = ({ layer = 0 }) => {
  const configs = [
    { count: 12, heightRange: [60, 110], spread: 100, color: '#14532d', opacity: 0.9, trunk: '#713f12' },
    { count: 8, heightRange: [45, 75], spread: 100, color: '#166534', opacity: 0.6, trunk: '#92400e' },
    { count: 6, heightRange: [30, 55], spread: 100, color: '#15803d', opacity: 0.35, trunk: '#a16207' },
  ];
  const cfg = configs[layer];
  const trees = Array.from({ length: cfg.count }, (_, i) => ({
    x: (i / cfg.count) * cfg.spread + Math.random() * (cfg.spread / cfg.count) * 0.6,
    h: cfg.heightRange[0] + Math.random() * (cfg.heightRange[1] - cfg.heightRange[0]),
    w: 28 + Math.random() * 24,
    swayDelay: Math.random() * 4,
  }));

  return (
    <div className="absolute bottom-0 left-0 right-0 pointer-events-none overflow-hidden"
      style={{ zIndex: 6 + layer, opacity: cfg.opacity }}>
      {trees.map((tree, i) => (
        <motion.div key={i} className="absolute bottom-0"
          style={{ left: `${tree.x}%`, transformOrigin: 'bottom center' }}
          initial={{ scaleY: 0 }} animate={{ scaleY: 1 }}
          transition={{ duration: 1.4, delay: 0.3 + i * 0.05, ease: [0.34, 1.56, 0.64, 1] }}>
          <motion.div
            animate={{ rotate: [-1, 1, -1] }}
            transition={{ duration: 5 + tree.swayDelay, repeat: Infinity, ease: 'easeInOut', delay: tree.swayDelay }}
            style={{ transformOrigin: 'bottom center' }}>
            <svg width={tree.w} height={tree.h} viewBox={`0 0 ${tree.w} ${tree.h}`} fill="none">
              {/* Trunk */}
              <rect x={tree.w / 2 - 3} y={tree.h * 0.62} width="6" height={tree.h * 0.38}
                fill={cfg.trunk} rx="2" opacity="0.8" />
              {/* Bottom foliage */}
              <ellipse cx={tree.w / 2} cy={tree.h * 0.65} rx={tree.w * 0.48} ry={tree.h * 0.28}
                fill={cfg.color} opacity="0.55" />
              {/* Mid foliage */}
              <ellipse cx={tree.w / 2} cy={tree.h * 0.45} rx={tree.w * 0.38} ry={tree.h * 0.25}
                fill={cfg.color} opacity="0.7" />
              {/* Top foliage */}
              <ellipse cx={tree.w / 2} cy={tree.h * 0.25} rx={tree.w * 0.26} ry={tree.h * 0.2}
                fill={cfg.color} opacity="0.85" />
              {/* Crown */}
              <ellipse cx={tree.w / 2} cy={tree.h * 0.1} rx={tree.w * 0.16} ry={tree.h * 0.12}
                fill={cfg.color} opacity="0.95" />
            </svg>
          </motion.div>
        </motion.div>
      ))}
    </div>
  );
};

// Grass blades row — lush field
const GrassField = () => (
  <div className="absolute bottom-0 left-0 right-0 pointer-events-none overflow-hidden"
    style={{ zIndex: 9, height: 48 }}>
    {Array.from({ length: 80 }, (_, i) => {
      const h = 20 + Math.random() * 28;
      const x = (i / 80) * 100 + Math.random() * 0.8;
      const delay = Math.random() * 3;
      const tilt = (Math.random() - 0.5) * 8;
      return (
        <motion.div key={i} className="absolute bottom-0"
          style={{ left: `${x}%`, transformOrigin: 'bottom center' }}
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1, rotate: [tilt - 2, tilt + 2, tilt - 2] }}
          transition={{
            scaleY: { duration: 0.9, delay: 0.8 + i * 0.008, ease: [0.34, 1.56, 0.64, 1] },
            rotate: { duration: 3 + delay, repeat: Infinity, ease: 'easeInOut', delay },
          }}>
          <svg width="6" height={h} viewBox={`0 0 6 ${h}`} fill="none">
            <path d={`M3 ${h} C3 ${h} ${1 + Math.random() * 2} ${h * 0.4} ${2 + Math.random() * 2} 0`}
              stroke={`hsl(${130 + Math.random() * 20}, ${60 + Math.random() * 25}%, ${35 + Math.random() * 15}%)`}
              strokeWidth="1.2" strokeLinecap="round" />
          </svg>
        </motion.div>
      );
    })}
  </div>
);

// Wheat stalks
const WheatField = () => (
  <div className="absolute bottom-0 left-0 right-0 pointer-events-none overflow-hidden"
    style={{ zIndex: 10, height: 70 }}>
    {Array.from({ length: 45 }, (_, i) => {
      const x = (i / 45) * 100 + Math.random() * 1.5;
      const delay = Math.random() * 2;
      return (
        <motion.div key={i} className="absolute bottom-0"
          style={{ left: `${x}%`, transformOrigin: 'bottom center' }}
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1, rotate: [-2, 2, -2] }}
          transition={{
            scaleY: { duration: 1, delay: 1 + i * 0.015, ease: [0.34, 1.56, 0.64, 1] },
            rotate: { duration: 4 + delay, repeat: Infinity, ease: 'easeInOut', delay },
          }}>
          <svg width="12" height="68" viewBox="0 0 12 68" fill="none">
            <path d="M6 68 L6 20" stroke="#d97706" strokeWidth="1.2" opacity="0.7" />
            <ellipse cx="6" cy="18" rx="3" ry="5" fill="#b45309" opacity="0.65" />
            <ellipse cx="6" cy="13" rx="2.5" ry="4" fill="#92400e" opacity="0.55"
              style={{ transform: 'rotate(-15deg)', transformOrigin: '6px 13px' }} />
            <ellipse cx="6" cy="13" rx="2.5" ry="4" fill="#92400e" opacity="0.55"
              style={{ transform: 'rotate(15deg)', transformOrigin: '6px 13px' }} />
          </svg>
        </motion.div>
      );
    })}
  </div>
);

// Animated plants / sprouts
const GrowingPlant = ({ delay = 0, size = 1 }) => (
  <motion.div
    initial={{ scaleY: 0, opacity: 0 }}
    whileInView={{ scaleY: 1, opacity: 1 }}
    viewport={{ once: true }}
    transition={{ duration: 1.6, delay, ease: [0.34, 1.56, 0.64, 1] }}
    style={{ transformOrigin: 'bottom center', display: 'inline-block' }}>
    <svg width={50 * size} height={70 * size} viewBox="0 0 50 70" fill="none">
      <path d="M25 70 C25 70 25 22 25 10" stroke="#15803d" strokeWidth="2.5" strokeLinecap="round" />
      <motion.path d="M25 38 C18 30 6 33 9 18 C23 18 29 30 25 38Z" fill="#22c55e" opacity="0.75"
        initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }}
        transition={{ duration: 0.9, delay: delay + 0.5 }}
        style={{ transformOrigin: '17px 28px' }} />
      <motion.path d="M25 46 C32 38 44 41 41 26 C27 26 21 38 25 46Z" fill="#4ade80" opacity="0.65"
        initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }}
        transition={{ duration: 0.9, delay: delay + 0.75 }}
        style={{ transformOrigin: '33px 36px' }} />
      <motion.ellipse cx="25" cy="10" rx="6" ry="7" fill="#86efac" opacity="0.85"
        initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }}
        transition={{ duration: 0.7, delay: delay + 1.1 }}
        style={{ transformOrigin: '25px 10px' }} />
    </svg>
  </motion.div>
);

// Flower
const Flower = ({ color = '#f9a8d4', delay = 0, size = 1 }) => (
  <motion.div
    initial={{ scale: 0, rotate: -45 }} whileInView={{ scale: 1, rotate: 0 }} viewport={{ once: true }}
    transition={{ duration: 1, delay, type: 'spring', stiffness: 180, damping: 12 }}
    style={{ display: 'inline-block' }}>
    <svg width={36 * size} height={52 * size} viewBox="0 0 36 52" fill="none">
      <path d="M18 52 C18 52 17 35 18 22" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" />
      <path d="M18 35 C14 30 8 31 10 24 C16 24 20 30 18 35Z" fill="#4ade80" opacity="0.5" />
      {[0, 51.4, 102.8, 154.2, 205.7, 257.1, 308.6].map((deg, i) => (
        <motion.ellipse key={i} cx="18" cy="14" rx="5.5" ry="9" fill={color} opacity="0.72"
          style={{ transformOrigin: '18px 18px', transform: `rotate(${deg}deg)` }}
          animate={{ opacity: [0.55, 0.9, 0.55], scaleY: [0.95, 1.05, 0.95] }}
          transition={{ duration: 3.5, delay: i * 0.12, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
      <circle cx="18" cy="14" r="5.5" fill="#fef08a" />
      <circle cx="18" cy="14" r="3" fill="#fbbf24" />
    </svg>
  </motion.div>
);

// Fireflies
const Fireflies = ({ count = 14 }) => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 5 }}>
    {Array.from({ length: count }, (_, i) => (
      <motion.div key={i} className="absolute"
        style={{ left: `${5 + Math.random() * 88}%`, top: `${15 + Math.random() * 65}%` }}
        animate={{
          opacity: [0, 0, 0.9, 0.4, 0.9, 0],
          scale: [0.4, 0.4, 1.8, 1, 1.8, 0.4],
          x: [(Math.random() - 0.5) * 40, 0, (Math.random() - 0.5) * 40],
          y: [(Math.random() - 0.5) * 30, 0, (Math.random() - 0.5) * 30],
        }}
        transition={{ duration: 3 + Math.random() * 2, delay: Math.random() * 4, repeat: Infinity, ease: 'easeInOut' }}>
        <div className="w-1.5 h-1.5 rounded-full"
          style={{ background: 'radial-gradient(circle, #fef08a, #fbbf24)', boxShadow: '0 0 6px #fef08a, 0 0 12px #fbbf24' }} />
      </motion.div>
    ))}
  </div>
);

// Water drops / puddle ripples
const PuddleRipples = () => (
  <div className="absolute bottom-0 left-0 right-0 h-20 pointer-events-none overflow-hidden" style={{ zIndex: 11 }}>
    {Array.from({ length: 6 }, (_, i) => (
      <motion.div key={i} className="absolute"
        style={{ left: `${12 + i * 14}%`, bottom: 12, width: 8, height: 4, borderRadius: '50%', border: '1px solid rgba(147,197,253,0.4)' }}
        animate={{ scaleX: [1, 4, 7], scaleY: [1, 2, 3.5], opacity: [0.6, 0.25, 0] }}
        transition={{ duration: 2.8, delay: i * 0.55, repeat: Infinity, ease: 'easeOut' }}
      />
    ))}
  </div>
);

// Soil stripe
const SoilStripe = () => (
  <div className="absolute bottom-0 left-0 right-0 h-5 pointer-events-none" style={{
    zIndex: 12,
    background: 'linear-gradient(to bottom, rgba(92,45,10,0), rgba(92,45,10,0.55) 60%, rgba(66,32,7,0.7))',
  }} />
);

/* ════════════════════════════════════════════
   ANIMATED COUNTER
════════════════════════════════════════════ */
const Counter = ({ target, suffix = '' }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const [started, setStarted] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting && !started) setStarted(true); });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [started]);
  useEffect(() => {
    if (!started) return;
    let val = 0; const step = target / 60;
    const timer = setInterval(() => {
      val += step;
      if (val >= target) { setCount(target); clearInterval(timer); } else setCount(Math.floor(val));
    }, 24);
    return () => clearInterval(timer);
  }, [started, target]);
  return <span ref={ref}>{count}{suffix}</span>;
};

/* ════════════════════════════════════════════
   STEP BADGE
════════════════════════════════════════════ */
const StepBadge = ({ n, text }) => (
  <div className="flex items-start gap-3">
    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-black flex items-center justify-center mt-0.5 font-mono">{n}</span>
    <span className="text-amber-100/50 text-sm leading-relaxed">{text}</span>
  </div>
);

/* ════════════════════════════════════════════
   FEATURES DATA
════════════════════════════════════════════ */
const FEATURES = [
  { id: 'diagnose', icon: <Scan size={22} />, color: '#86efac', label: 'AI Disease Detection', sub: 'Diagnose · Scan', headline: 'Instant Leaf Diagnosis', desc: 'TensorFlow deep learning identifies 38+ plant diseases from a single photo. Get precise treatment recommendations and preventive measures in 3 seconds.', steps: ['Click "Diagnose" in the nav bar.', 'Upload a clear photo of a plant leaf.', 'AI analyzes — healthy or diseased — with full treatment plan.', 'Save scan results to Crop Inventory for ongoing tracking.'], tag: 'TensorFlow · Deep Learning' },
  { id: 'dashboard', icon: <BarChart3 size={22} />, color: '#fcd34d', label: 'Farmer Dashboard', sub: 'Portfolio · Health Score', headline: 'Your Farm at a Glance', desc: 'Your central hub — weather, Mandi prices, growing season, crop health scores, and disease alerts in one unified real-time view.', steps: ["Quick Tiles: today's weather, live Mandi prices, growing season.", 'Field Portfolio: all tracked crops with health scores.', 'Active disease alerts surface automatically.', 'Quick Sidebar: jump to forecasts, calendar, or market prices.'], tag: 'Real-Time · Live Sync' },
  { id: 'weather', icon: <Cloud size={22} />, color: '#7dd3fc', label: 'Weather & Mandi', sub: 'Forecasts · Live Prices', headline: 'Real-Time Data You Can Act On', desc: 'Hyper-local multi-day weather forecasts and live Mandi commodity prices across local markets — updated in real-time, zero delay.', steps: ['Open "Weather" tile for multi-day hyper-local forecasts.', 'Open "Mandi Prices" to search live commodity rates by location.', 'Data refreshes automatically — no manual refresh needed.'], tag: 'Hyper-Local · Live Rates' },
  { id: 'copilot', icon: <MessageSquare size={22} />, color: '#c4b5fd', label: 'AI Copilot', sub: 'Smart Chat · Farm Advisor', headline: 'Your Personal Farming Assistant', desc: 'A smart conversational assistant trained on agriculture. Ask about crop schedules, fertilizers, disease prevention — fully context-aware.', steps: ['Click the "Copilot" tile on your dashboard.', 'Ask any farming question — schedules, fertilizers, pests.', 'Bot retains full conversation context for personalized advice.'], tag: 'Context-Aware · Agricultural AI' },
  { id: 'inventory', icon: <Package size={22} />, color: '#fb923c', label: 'Profile & Inventory', sub: 'Reports · PDF Export', headline: 'Track, Report & Share', desc: 'All scanned crops with detailed health reports. Download official PDF disease reports with the KisanAI stamp — shareable with authorities.', steps: ['View all scanned crops with history and treatments.', 'Download PDF disease reports with official KisanAI stamp.', 'Update your village, crops, and instruments in profile.', 'Community farmers can discover and connect with you.'], tag: 'PDF Export · KisanAI Stamp' },
];

/* ════════════════════════════════════════════
   MAIN PAGE
════════════════════════════════════════════ */
export default function LandingPage() {
  const { language, setLanguage } = useLanguage();
  const [lang, setLang] = useState(language || 'en');
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);
  const [scrollPhase, setScrollPhase] = useState('dawn'); // controls scene lighting
  const t = LANGS[lang];

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 80, damping: 30 });
  const { scrollY } = useScroll();
  const heroOpacity = useTransform(scrollY, [0, 600], [1, 0]);
  const heroY = useTransform(scrollY, [0, 600], [0, 120]);

  useEffect(() => {
    const unsub = scrollY.on('change', v => {
      if (v < 100) setScrollPhase('dawn');
      else if (v < 800) setScrollPhase('morning');
      else if (v < 2000) setScrollPhase('noon');
      else setScrollPhase('evening');
    });
    return unsub;
  }, [scrollY]);

  // Sky color based on phase
  const skyBg = {
    dawn: 'linear-gradient(180deg, #0f0c29 0%, #1a1040 20%, #2d1b69 38%, #8b2fc9 55%, #e85d04 78%, #f48c06 100%)',
    morning: 'linear-gradient(180deg, #0c1a3e 0%, #0d2b1a 45%, #0d1a0f 100%)',
    noon: 'linear-gradient(180deg, #0d1a0f 0%, #0d1a0f 100%)',
    evening: 'linear-gradient(180deg, #0d1a0f 0%, #0d1a0f 100%)',
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 44 },
    show: { opacity: 1, y: 0, transition: { duration: 1, ease: [0.16, 1, 0.3, 1] } },
  };
  const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.14, delayChildren: 0.2 } } };

  return (
    <div className="min-h-screen overflow-x-hidden relative" style={{ color: '#f0fdf4' }}>

      <SpaceStars />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@400;500;600;700;800;900&family=Noto+Sans+Devanagari:wght@400;500;600;700;800&family=Noto+Sans+Tamil:wght@400;600;700&family=Noto+Sans+Bengali:wght@400;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap');

        * { box-sizing: border-box; }

        body { font-family: 'Baloo 2', 'Noto Sans Devanagari', sans-serif; }

        :root {
          --leaf: #16a34a; --leaf-light: #4ade80; --sun: #fbbf24;
          --earth: #92400e; --harvest: #f59e0b; --sky-deep: #0c1a3e;
        }

        .font-mono-custom { font-family: 'JetBrains Mono', monospace; }

        .field-bg {
          background-image:
            repeating-linear-gradient(0deg, transparent, transparent 59px, rgba(74,222,128,0.025) 60px),
            repeating-linear-gradient(90deg, transparent, transparent 59px, rgba(74,222,128,0.025) 60px);
        }

        .glass-leaf {
          background: rgba(22,163,74,0.06);
          border: 1px solid rgba(74,222,128,0.14);
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
        }

        .glass-dark {
          background: rgba(13,26,15,0.85);
          border: 1px solid rgba(74,222,128,0.1);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
        }

        .glass-amber {
          background: rgba(146,64,14,0.08);
          border: 1px solid rgba(251,191,36,0.15);
          backdrop-filter: blur(16px);
        }

        .glow-green { text-shadow: 0 0 50px rgba(74,222,128,0.55), 0 0 100px rgba(74,222,128,0.25); }
        .glow-amber { text-shadow: 0 0 40px rgba(251,191,36,0.6), 0 0 80px rgba(249,115,22,0.3); }
        .glow-btn { box-shadow: 0 0 40px rgba(74,222,128,0.35), 0 8px 32px rgba(74,222,128,0.2); }
        .glow-btn:hover { box-shadow: 0 0 70px rgba(74,222,128,0.5), 0 12px 40px rgba(74,222,128,0.3); }

        .lang-pill {
          transition: all 0.2s ease;
          border: 1px solid rgba(74,222,128,0.18);
          background: rgba(22,163,74,0.07);
          color: #86efac;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.08em;
          padding: 5px 12px;
          border-radius: 24px;
          cursor: pointer;
          white-space: nowrap;
          font-family: 'JetBrains Mono', monospace;
        }
        .lang-pill:hover, .lang-pill.active {
          background: rgba(74,222,128,0.16);
          border-color: rgba(74,222,128,0.45);
          color: #4ade80;
        }

        .timeline-line {
          background: linear-gradient(to bottom, transparent, rgba(74,222,128,0.3) 20%, rgba(251,191,36,0.3) 50%, rgba(74,222,128,0.2) 80%, transparent);
        }

        @keyframes sway-gentle { 0%,100%{transform:rotate(-1.5deg)} 50%{transform:rotate(1.5deg)} }
        @keyframes sway-medium { 0%,100%{transform:rotate(-3deg)} 50%{transform:rotate(3deg)} }
        @keyframes float-up { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        @keyframes shimmer-h { 0%{background-position:200%} 100%{background-position:-200%} }
        @keyframes pulse-soft { 0%,100%{opacity:0.5; transform:scale(1)} 50%{opacity:1; transform:scale(1.08)} }
        @keyframes dawn-rise {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }

        .scroll-hide { scrollbar-width: none; }
        .scroll-hide::-webkit-scrollbar { display: none; }

        .story-italic { font-style: italic; color: rgba(240,253,244,0.38); letter-spacing: 0.05em; }
        .section-label { font-family: 'JetBrains Mono', monospace; font-size: 9px; letter-spacing: 0.5em; text-transform: uppercase; color: rgba(251,191,36,0.45); }

        /* Smooth sky transition */
        .hero-sky { transition: background 3s ease; }

        .nav-link { transition: color 0.2s; color: rgba(240,253,244,0.32); }
        .nav-link:hover { color: #4ade80; }

        .feature-tab { transition: all 0.25s ease; }
        .inventory-card:hover .card-glow { opacity: 0.12; }

        /* Footer */
        .footer-link { transition: color 0.2s; color: rgba(240,253,244,0.6); font-size: 14px; }
        .footer-link:hover { color: #4ade80; }
        .social-btn { transition: all 0.2s ease; }
        .social-btn:hover { background: rgba(74,222,128,0.15); border-color: rgba(74,222,128,0.4); color: #4ade80; }
      `}</style>

      {/* ── SCROLL PROGRESS BAR ── */}
      <motion.div className="fixed top-0 left-0 right-0 h-[2.5px] z-[300] origin-left"
        style={{ scaleX, background: 'linear-gradient(90deg, #15803d, #4ade80, #fbbf24, #f97316)' }} />

      {/* ══════════════════════════════════════════════
          NAVBAR
      ══════════════════════════════════════════════ */}
      <motion.nav
        initial={{ opacity: 0, y: -24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-0 left-0 right-0 z-[200] px-4 sm:px-8 py-3.5 flex items-center justify-between glass-dark">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center overflow-hidden p-1 shadow-lg"
            style={{ boxShadow: '0 0 20px rgba(74,222,128,0.2)' }}>
            <img src="/logo.png" className="w-full h-full object-contain" alt="KrishiAI"
              onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }} />
            <Leaf size={18} className="text-green-600 hidden" />
          </div>
          <div>
            <div className="font-black text-lg tracking-tight leading-none text-white">
              Krishi<span className="text-green-400">AI</span>
            </div>
            <div className="font-mono-custom text-[7px] text-green-500/35 tracking-[0.3em] uppercase mt-0.5 hidden sm:block">
              {lang === 'hi' ? 'किसान का साथी' : lang === 'ta' ? 'விவசாயியின் தோழன்' : lang === 'te' ? 'రైతు స్నేహితుడు' : lang === 'bn' ? 'কৃষকের বন্ধু' : lang === 'mr' ? 'शेतकऱ्याचा मित्र' : 'Smart Farming'}
            </div>
          </div>
        </Link>

        {/* Desktop nav */}
        <div className="hidden lg:flex items-center gap-7 font-mono-custom text-[10px] uppercase tracking-widest">
          <a href="#story" className="nav-link">Story</a>
          <a href="#features" className="nav-link">Features</a>
          <a href="#steps" className="nav-link">How It Works</a>
          <a href="#inventory" className="nav-link">Inventory</a>
        </div>

        <div className="flex items-center gap-2">
          {/* Lang switcher */}
          <div className="relative">
            <button className="lang-pill flex items-center gap-1.5" onClick={() => setShowLangMenu(p => !p)}>
              <span>{LANGS[lang].flag}</span>
              <span>{LANGS[lang].code}</span>
              <ChevronDown size={9} className={`transition-transform duration-200 ${showLangMenu ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
              {showLangMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.93 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.93 }}
                  transition={{ duration: 0.2 }}
                  className="absolute top-full right-0 mt-2 rounded-2xl overflow-hidden shadow-2xl"
                  style={{ background: '#0b1a0d', border: '1px solid rgba(74,222,128,0.2)', minWidth: 150, zIndex: 300 }}>
                  {Object.entries(LANGS).map(([k, v]) => (
                    <button key={k} onClick={() => { setLang(k); setLanguage(k); setShowLangMenu(false); }}
                      className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-3 transition-colors ${lang === k ? 'bg-green-500/12 text-green-400' : 'text-green-100/45 hover:bg-green-500/06 hover:text-green-300'}`}>
                      <span>{v.flag}</span>
                      <span className="font-semibold">{v.label}</span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <Link to="/login"
            className="flex items-center gap-2 px-4 py-2 rounded-xl font-mono-custom text-[9px] sm:text-[10px] uppercase tracking-widest font-bold transition-all"
            style={{ background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.22)', color: '#86efac' }}>
            <span className="hidden sm:inline">{t.launch}</span>
            <span className="sm:hidden">Open</span>
            <ArrowUpRight size={11} />
          </Link>
        </div>
      </motion.nav>

      {/* ══════════════════════════════════════════════
          HERO — MODERN & PROFESSIONAL
      ══════════════════════════════════════════════ */}
      <section className="relative min-h-screen flex flex-col items-center justify-center pt-20 overflow-hidden px-4">

        {/* Dynamic Moving Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <motion.div
            className="absolute top-[20%] left-[20%] w-[500px] h-[500px] rounded-full bg-green-500/10 blur-[120px]"
            animate={{ x: [0, 120, -80, 0], y: [0, -80, 120, 0], scale: [1, 1.1, 0.9, 1] }}
            transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute bottom-[10%] right-[10%] w-[600px] h-[600px] rounded-full bg-emerald-600/10 blur-[140px]"
            animate={{ x: [0, -150, 100, 0], y: [0, 100, -100, 0], scale: [1, 0.9, 1.15, 1] }}
            transition={{ duration: 30, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          />
          <motion.div
            className="absolute top-[40%] left-[60%] w-[400px] h-[400px] rounded-full bg-blue-500/10 blur-[120px]"
            animate={{ x: [0, 100, -50, 0], y: [0, 50, -100, 0] }}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 5 }}
          />
        </div>

        {/* HERO TEXT */}
        <motion.div style={{ opacity: heroOpacity, y: heroY, zIndex: 15 }}
          className="relative text-center max-w-5xl mx-auto w-full px-4">
          <motion.div variants={stagger} initial="hidden" animate="show">

            {/* Tagline */}
            <motion.div variants={fadeUp} className="flex justify-center mb-8">
              <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-[12px] font-bold uppercase tracking-[0.15em]"
                style={{ background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.2)', color: '#4ade80' }}>
                <Sprout size={14} className="text-green-400" /> {t.tagline}
              </span>
            </motion.div>

            {/* Main headline */}
            <motion.div variants={fadeUp} className="mb-6">
              <h1 className="font-black leading-[1.05] tracking-tight">
                <span className="block text-[clamp(2.5rem,8vw,6rem)] text-white">{t.hero1} <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-300">{t.hero2}</span></span>
              </h1>
            </motion.div>

            <motion.p variants={fadeUp}
              className="text-[clamp(1.2rem,3vw,1.8rem)] text-gray-300 font-medium tracking-wide mb-6">
              {t.hero3}
            </motion.p>

            {/* Sub copy */}
            <motion.p variants={fadeUp} className="text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed text-sm sm:text-base md:text-lg">
              {t.heroSub}
            </motion.p>

            {/* CTAs */}
            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <Link to="/login"
                className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-3.5 rounded-xl text-black font-bold text-sm tracking-wide transition-all hover:scale-105"
                style={{ background: '#4ade80', boxShadow: '0 8px 30px rgba(74,222,128,0.3)' }}>
                {t.launch}
                <ArrowRight size={16} />
              </Link>
              <a href="#features"
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-semibold text-sm transition-all hover:bg-white/10"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}>
                {t.seeFeatures} <ChevronDown size={14} />
              </a>
            </motion.div>

            {/* Stats */}
            <motion.div variants={fadeUp}
              className="pt-10 border-t grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto"
              style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
              {[{ v: 38, s: '+' }, { v: 98, s: '%' }, { v: 6, s: '' }].map((s, i) => (
                <div key={i} className="text-center px-4 py-4 transition-all">
                  <div className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-400 mb-2 drop-shadow-md">
                    <Counter target={s.v} suffix={s.s} />
                  </div>
                  <div className="text-[12px] font-bold text-gray-500 uppercase tracking-[0.2em]">{t.statsLabels[i]}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Bottom Fade Mask */}
        <div className="absolute bottom-0 left-0 right-0 h-40 pointer-events-none"
          style={{ background: 'linear-gradient(to top, #06090a, transparent)', zIndex: 20 }} />
      </section>

      {/* ══════════════════════════════════════════════
          STORY SECTION — "Dawn to Dusk" Timeline
          Each time entry uses rich descriptions.
          Rain effect appears during the Rain Alert.
      ══════════════════════════════════════════════ */}
      <section id="story" className="relative py-24 md:py-36 px-4 sm:px-8 overflow-hidden">

        {/* Subtle field bg */}
        <div className="absolute inset-0 field-bg opacity-40" />

        {/* Atmospheric side gradients */}
        <div className="absolute top-0 left-0 w-64 h-full pointer-events-none"
          style={{ background: 'linear-gradient(to right, rgba(22,163,74,0.04), transparent)' }} />
        <div className="absolute top-0 right-0 w-64 h-full pointer-events-none"
          style={{ background: 'linear-gradient(to left, rgba(22,163,74,0.04), transparent)' }} />

        <div className="max-w-6xl mx-auto relative" style={{ zIndex: 5 }}>
          <motion.div initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-center mb-20">
            <div className="section-label mb-4">// {lang === 'hi' ? 'किसान की कहानी' : lang === 'ta' ? 'விவசாயியின் கதை' : lang === 'te' ? 'రైతు కథ' : lang === 'bn' ? 'কৃষকের গল্প' : lang === 'mr' ? 'शेतकऱ्याची गोष्ट' : "The Farmer's Story"}</div>
            <h2 className="text-4xl sm:text-6xl md:text-8xl font-black tracking-tighter leading-none mb-4">
              <span className="text-white/85">{t.storyTitle} </span>
              <span className="text-amber-400 glow-amber">{t.storySpan}</span>
            </h2>
            <p className="story-italic text-base max-w-md mx-auto">{t.storyDesc}</p>
          </motion.div>

          {/* Timeline */}
          <div className="relative">
            {/* Central vertical line */}
            <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2 timeline-line" />

            {t.timeStory.map((item, i) => {
              const colors = ['#fbbf24', '#86efac', '#7dd3fc', '#c4b5fd', '#fb923c'];
              const icons = [<Sun size={18} />, <Scan size={18} />, <Cloud size={18} />, <MessageSquare size={18} />, <Package size={18} />];
              const natures = [
                <AdvancedSun phase="dawn" />,
                <GrowingPlant delay={0} />,
                <div className="relative w-24 h-20 overflow-hidden rounded-xl glass-leaf flex items-end justify-center pb-2">
                  <div className="absolute inset-0"><AdvancedRain /></div>
                  <span className="text-blue-300 text-xs font-mono-custom relative z-10">🌧️ {lang === 'hi' ? 'बारिश' : 'Rain'}</span>
                </div>,
                <GrowingPlant delay={0.2} />,
                <Flower color="#fb923c" />,
              ];
              const side = i % 2 === 0 ? 'left' : 'right';
              const color = colors[i];

              return (
                <motion.div key={i}
                  initial={{ opacity: 0, x: side === 'left' ? -50 : 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.85, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                  className={`relative flex gap-6 mb-10 md:mb-8 ${side === 'right' ? 'md:flex-row-reverse' : 'md:flex-row'} items-start md:items-center`}>

                  {/* Card side (desktop) */}
                  <div className={`hidden md:flex md:w-[calc(50%-3rem)] ${side === 'left' ? 'justify-end' : 'justify-start'}`}>
                    <motion.div className="glass-leaf rounded-2xl p-6 max-w-sm w-full relative overflow-hidden"
                      whileHover={{ y: -4, scale: 1.01 }} transition={{ duration: 0.3 }}>
                      <div className="absolute top-0 right-0 w-24 h-24 rounded-full blur-[60px] opacity-8 pointer-events-none"
                        style={{ background: color }} />
                      <div className="font-mono-custom text-[10px] uppercase tracking-widest mb-2" style={{ color }}>{item.time}</div>
                      <h3 className="font-black text-xl mb-3 text-white/90">{item.title}</h3>
                      <p className="text-green-100/48 text-sm leading-relaxed mb-4">{item.desc}</p>
                      <div className="flex justify-center opacity-55">{natures[i]}</div>
                    </motion.div>
                  </div>

                  {/* Center dot */}
                  <div className="hidden md:flex items-center justify-center w-14 flex-shrink-0 relative">
                    <motion.div className="w-11 h-11 rounded-full flex items-center justify-center"
                      style={{ background: `${color}18`, border: `2px solid ${color}`, color }}
                      whileHover={{ scale: 1.15 }} transition={{ duration: 0.2 }}>
                      {icons[i]}
                    </motion.div>
                  </div>

                  {/* Mobile card */}
                  <div className="md:hidden glass-leaf rounded-2xl p-5 w-full">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: `${color}18`, color }}>{icons[i]}</div>
                      <div>
                        <div className="font-mono-custom text-[9px] uppercase tracking-widest" style={{ color }}>{item.time}</div>
                        <div className="font-black text-base text-white">{item.title}</div>
                      </div>
                    </div>
                    <p className="text-green-100/48 text-sm leading-relaxed">{item.desc}</p>
                  </div>

                  <div className="hidden md:block md:w-[calc(50%-3rem)]" />
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Puddle ripples at bottom of rain section */}
        <PuddleRipples />
      </section>

      {/* ══════════════════════════════════════════════
          FEATURES SECTION
      ══════════════════════════════════════════════ */}
      <section id="features" className="py-20 md:py-32 px-4 sm:px-6 md:px-14 max-w-7xl mx-auto relative">

        {/* Decorative plants */}
        <div className="absolute left-0 top-28 opacity-20 pointer-events-none hidden lg:block">
          <GrowingPlant delay={0} />
        </div>
        <div className="absolute right-2 top-48 opacity-18 pointer-events-none hidden lg:block">
          <Flower color="#4ade80" delay={0.4} />
        </div>

        <motion.div initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="mb-10 md:mb-16">
          <div className="section-label mb-4">// {lang === 'hi' ? 'मुख्य सुविधाएं' : lang === 'ta' ? 'முக்கிய அம்சங்கள்' : lang === 'te' ? 'ముఖ్య లక్షణాలు' : lang === 'bn' ? 'মূল বৈশিষ্ট্য' : lang === 'mr' ? 'मुख्य वैशिष्ट्ये' : 'Core Features'}</div>
          <h2 className="text-4xl sm:text-6xl md:text-8xl font-black tracking-tighter leading-none">
            {t.featTitle}<br />
            <span className="text-green-400 glow-green">{t.featSpan}</span>{' '}
            <span className="text-white/14">{t.featEnd}</span>
          </h2>
        </motion.div>

        {/* Feature tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto scroll-hide pb-2">
          {FEATURES.map((f, i) => (
            <button key={f.id} onClick={() => setActiveFeature(i)}
              className="feature-tab flex-shrink-0 flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl font-mono-custom text-[9px] sm:text-[10px] uppercase tracking-widest border font-bold"
              style={activeFeature === i
                ? { background: `${f.color}10`, borderColor: `${f.color}28`, color: f.color }
                : { background: 'rgba(255,255,255,0.018)', borderColor: 'rgba(255,255,255,0.07)', color: 'rgba(240,253,244,0.28)' }}>
              <span style={{ color: activeFeature === i ? f.color : 'rgba(240,253,244,0.22)' }}>{f.icon}</span>
              <span className="hidden sm:inline">{f.label}</span>
              <span className="sm:hidden">{f.label.split(' ')[0]}</span>
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={activeFeature}
            initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -18 }}
            transition={{ duration: 0.32 }}
            className="grid md:grid-cols-5 gap-4 sm:gap-6">

            <div className="md:col-span-3 glass-leaf rounded-2xl sm:rounded-3xl p-6 sm:p-10 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-72 h-72 rounded-full blur-[140px] opacity-8 pointer-events-none"
                style={{ background: FEATURES[activeFeature].color }} />
              <div className="flex items-start gap-4 mb-6">
                <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{ background: `${FEATURES[activeFeature].color}12`, color: FEATURES[activeFeature].color, border: `1px solid ${FEATURES[activeFeature].color}22` }}>
                  {FEATURES[activeFeature].icon}
                </div>
                <div>
                  <h3 className="font-black text-xl sm:text-2xl tracking-tight mb-1 text-white">{FEATURES[activeFeature].headline}</h3>
                  <div className="font-mono-custom text-[9px] text-green-300/28 uppercase tracking-widest">{FEATURES[activeFeature].sub}</div>
                </div>
              </div>
              <p className="text-green-100/44 leading-relaxed text-sm sm:text-base mb-7">{FEATURES[activeFeature].desc}</p>
              <div className="space-y-3.5 mb-7">
                <div className="section-label mb-3">{t.howUse}</div>
                {FEATURES[activeFeature].steps.map((s, i) => <StepBadge key={i} n={i + 1} text={s} />)}
              </div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full font-mono-custom text-[9px] uppercase tracking-widest font-bold"
                style={{ background: `${FEATURES[activeFeature].color}10`, color: FEATURES[activeFeature].color, border: `1px solid ${FEATURES[activeFeature].color}18` }}>
                <Zap size={9} />{FEATURES[activeFeature].tag}
              </div>
            </div>

            <div className="md:col-span-2 grid grid-cols-2 md:grid-cols-1 gap-3">
              {FEATURES.map((f, i) => (
                <motion.button key={f.id} onClick={() => setActiveFeature(i)}
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                  className="text-left p-4 sm:p-5 rounded-2xl transition-all"
                  style={activeFeature === i
                    ? { background: `${f.color}07`, border: `1px solid ${f.color}22` }
                    : { background: 'rgba(255,255,255,0.018)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: `${f.color}12`, color: f.color }}>{f.icon}</div>
                    {activeFeature === i && (
                      <motion.div className="w-1.5 h-1.5 rounded-full"
                        animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 1.5, repeat: Infinity }}
                        style={{ background: f.color }} />
                    )}
                  </div>
                  <div className="font-bold text-xs sm:text-sm tracking-tight leading-tight"
                    style={{ color: activeFeature === i ? f.color : 'rgba(240,253,244,0.48)' }}>{f.label}</div>
                  <div className="font-mono-custom text-[7px] sm:text-[8px] text-green-300/18 uppercase tracking-wider mt-1 hidden sm:block">{f.sub}</div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </section>

      {/* ══════════════════════════════════════════════
          HOW IT WORKS — 3 Steps
      ══════════════════════════════════════════════ */}
      <section id="steps" className="py-20 md:py-28 px-4 sm:px-6 md:px-14 relative overflow-hidden"
        style={{ borderTop: '1px solid rgba(74,222,128,0.07)' }}>

        {/* Flowers at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-44 pointer-events-none" style={{ zIndex: 0 }}>
          {[8, 22, 38, 55, 68, 82].map((x, i) => (
            <div key={i} style={{ position: 'absolute', left: `${x}%`, bottom: 0 }}>
              <Flower color={['#86efac', '#fcd34d', '#7dd3fc', '#c4b5fd', '#fb923c', '#f87171'][i]} delay={i * 0.15} />
            </div>
          ))}
          <GrassField />
        </div>

        <div className="max-w-7xl mx-auto relative" style={{ zIndex: 2 }}>
          <motion.div initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-center mb-14">
            <div className="section-label mb-3">// Getting Started</div>
            <h2 className="text-3xl sm:text-5xl md:text-7xl font-black tracking-tighter">
              {t.howTitle} <span className="text-green-400 glow-green">{t.howSpan}</span>
            </h2>
          </motion.div>

          <div className="grid sm:grid-cols-3 gap-5 sm:gap-8">
            {[
              { n: '01', icon: <User size={22} />, color: '#86efac', title: 'Login / Signup', desc: lang === 'hi' ? 'लैंडिंग पेज खोलें और "KrishiAI खोलें" क्लिक करें। अकाउंट बनाएं या लॉगिन करें — आपका पर्सनलाइज़्ड किसान डैशबोर्ड तैयार है।' : 'Open the landing page and click "Launch KrishiAI". Create your account or sign in — your personalized farmer dashboard awaits.', nature: <GrowingPlant delay={0.1} /> },
              { n: '02', icon: <Scan size={22} />, color: '#fcd34d', title: lang === 'hi' ? 'फसल स्कैन करें' : 'Scan Your Crops', desc: lang === 'hi' ? 'Diagnose में जाएं, पत्ती की फोटो अपलोड करें। AI तुरंत रोग की पहचान करता है और उपचार बताता है। रिपोर्ट Inventory में सेव।' : 'Go to Diagnose, upload a leaf photo. AI instantly identifies diseases with treatment plan. Report saved to Inventory.', nature: <Flower color="#fcd34d" delay={0.2} /> },
              { n: '03', icon: <BarChart3 size={22} />, color: '#7dd3fc', title: lang === 'hi' ? 'मॉनिटर करें' : 'Monitor & Connect', desc: lang === 'hi' ? 'फसल स्वास्थ्य ट्रैक करें, मौसम और मंडी भाव देखें, और AI Copilot से बात करें — सब एक डैशबोर्ड से।' : 'Track crop health, check weather & Mandi prices, and chat with AI Copilot — all from one unified dashboard.', nature: <Flower color="#7dd3fc" delay={0.3} /> },
            ].map((s, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 32 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ delay: i * 0.14, ease: [0.16, 1, 0.3, 1] }}
                whileHover={{ y: -6 }}
                className="glass-leaf rounded-2xl p-6 sm:p-8 relative overflow-hidden group transition-all">
                <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-[80px] opacity-0 group-hover:opacity-10 transition-opacity pointer-events-none"
                  style={{ background: s.color }} />
                <div className="font-mono-custom text-[11px] font-bold mb-5 tracking-widest" style={{ color: `${s.color}50` }}>{s.n}</div>
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
                  style={{ background: `${s.color}12`, color: s.color, border: `1px solid ${s.color}20` }}>{s.icon}</div>
                <h3 className="font-black text-lg tracking-tight mb-2 text-white">{s.title}</h3>
                <p className="text-green-100/38 text-sm leading-relaxed mb-5">{s.desc}</p>
                <div className="opacity-38 flex justify-center">{s.nature}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          INVENTORY & PROFILE
      ══════════════════════════════════════════════ */}
      <section id="inventory" className="py-20 md:py-28 px-4 sm:px-6 md:px-14"
        style={{ borderTop: '1px solid rgba(74,222,128,0.07)' }}>
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <div className="section-label mb-3">// Profile & Inventory</div>
            <h2 className="text-3xl sm:text-5xl md:text-7xl font-black tracking-tighter">
              {lang === 'hi' ? 'हर स्कैन।' : lang === 'ta' ? 'ஒவ்வொரு ஸ்கேன்.' : lang === 'te' ? 'ప్రతి స్కాన్.' : lang === 'bn' ? 'প্রতিটি স্ক্যান।' : lang === 'mr' ? 'प्रत्येक स्कॅन।' : 'Every scan.'}{' '}
              <span className="text-amber-400 glow-amber">{lang === 'hi' ? 'हर रिपोर्ट।' : lang === 'ta' ? 'ஒவ்வொரு அறிக்கை.' : lang === 'te' ? 'ప్రతి నివేదిక.' : lang === 'bn' ? 'প্রতিটি রিপোর্ট।' : lang === 'mr' ? 'प्रत्येक अहवाल।' : 'Every report.'}</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5">
            {[
              { icon: <Package size={19} />, color: '#fb923c', title: lang === 'hi' ? 'फसल इन्वेंटरी' : 'Crop Inventory', desc: lang === 'hi' ? 'सभी स्कैन की गई फसलें — विस्तृत स्वास्थ्य रिपोर्ट, रोग इतिहास और उपचार सहित। खोज-योग्य और व्यवस्थित।' : 'All scanned crops with detailed health reports, disease history, and treatments — searchable and organized.' },
              { icon: <FileText size={19} />, color: '#86efac', title: lang === 'hi' ? 'PDF रिपोर्ट' : 'PDF Disease Reports', desc: lang === 'hi' ? 'KisanAI स्टांप के साथ आधिकारिक रोग रिपोर्ट डाउनलोड करें — कृषि अधिकारियों के साथ शेयर करें।' : 'Download official reports with the KisanAI stamp — shareable with agricultural officers or stored for records.' },
              { icon: <User size={19} />, color: '#c4b5fd', title: lang === 'hi' ? 'किसान प्रोफाइल' : 'Farmer Profile', desc: lang === 'hi' ? 'अपना गाँव, स्थान, फसलें और उपकरण अपडेट करें — समुदाय के किसान आपको खोज सकते हैं।' : 'Update your village, location, crops, and instruments — community farmers can find and connect with you.' },
              { icon: <Calendar size={19} />, color: '#7dd3fc', title: lang === 'hi' ? 'फसल कैलेंडर' : 'Crop Calendar', desc: lang === 'hi' ? 'बुवाई और कटाई का शेड्यूल बनाएं। मौसमी अलर्ट पाएं ताकि कोई महत्वपूर्ण समय न चूकें।' : 'Plan planting and harvest schedules. Get seasonal alerts so you never miss a critical farming window.' },
              { icon: <ShoppingCart size={19} />, color: '#fcd34d', title: lang === 'hi' ? 'मंडी भाव' : 'Live Mandi Prices', desc: lang === 'hi' ? 'स्थानीय मंडी बाजारों में लाइव कमोडिटी दर खोजें। रियल-टाइम डेटा से बेहतर बिक्री निर्णय लें।' : 'Search live commodity rates across local Mandi markets. Make smarter selling decisions with real-time data.' },
              { icon: <Shield size={19} />, color: '#f87171', title: lang === 'hi' ? 'रोग अलर्ट' : 'Disease Alerts', desc: lang === 'hi' ? 'जब किसी ट्रैक की गई फसल में रोग के संकेत दिखें, तो डैशबोर्ड पर स्वचालित अलर्ट — नुकसान से पहले सतर्क।' : 'Automatic alerts on your dashboard when any tracked crop shows disease signs — stay ahead before damage spreads.' },
            ].map((c, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 22 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                whileHover={{ y: -5 }}
                className="inventory-card glass-leaf rounded-2xl p-5 sm:p-7 group transition-all relative overflow-hidden cursor-default">
                <div className="card-glow absolute top-0 right-0 w-24 h-24 rounded-full blur-[60px] opacity-0 transition-opacity pointer-events-none"
                  style={{ background: c.color }} />
                <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: `${c.color}12`, color: c.color, border: `1px solid ${c.color}20` }}>{c.icon}</div>
                <h3 className="font-black text-base sm:text-lg tracking-tight mb-2 text-white">{c.title}</h3>
                <p className="text-green-100/33 text-sm leading-relaxed">{c.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          CTA — MODERN & PROFESSIONAL
      ══════════════════════════════════════════════ */}
      <section className="relative py-32 sm:py-48 px-4 text-center overflow-hidden">

        {/* Subtle Dark Background Orbs */}
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: 'radial-gradient(circle at 50% 100%, rgba(74, 222, 128, 0.06) 0%, transparent 60%)'
        }}
        />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-[100%] bg-emerald-500/5 blur-[120px] pointer-events-none z-0" />

        {/* CTA Content Container */}
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}
          className="relative max-w-4xl mx-auto z-10 p-8 sm:p-16">

          <div className="flex justify-center mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full"
              style={{ background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74, 222, 128, 0.2)' }}>
              <Sprout size={12} className="text-green-400" />
              <span className="text-[10px] sm:text-xs font-bold text-green-400 uppercase tracking-widest">
                {lang === 'hi' ? 'लाखों किसानों से जुड़ें' : lang === 'ta' ? 'இலட்சக்கணக்கான விவசாயிகளுடன்' : lang === 'te' ? 'లక్షల రైతులతో చేరండి' : lang === 'bn' ? 'লক্ষ কৃষকদের সাথে যোগ দিন' : lang === 'mr' ? 'लाखो शेतकऱ्यांसोबत जुळा' : 'Join thousands of farmers'}
              </span>
            </div>
          </div>

          <h2 className="text-[clamp(2.5rem,8vw,5.5rem)] font-black tracking-tighter leading-[1.05] mb-6">
            <span className="text-white">{t.ctaTitle}</span> <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-300">{t.ctaSpan}</span>
          </h2>

          <p className="text-gray-400 text-[clamp(1rem,2vw,1.15rem)] mb-10 max-w-2xl mx-auto leading-relaxed">{t.ctaSub}</p>

          {/* Language Pills - Professional Look */}
          <div className="flex flex-wrap justify-center gap-3 mb-10">
            {Object.entries(LANGS).map(([k, v]) => (
              <button key={k} onClick={() => { setLang(k); setLanguage(k); }}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[12px] font-bold uppercase tracking-wider transition-all duration-200
                ${lang === k ? 'bg-green-500/10 border-green-500/40 text-green-400' : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:text-white'} border`}
              >
                <span>{v.flag}</span> <span>{v.code}</span>
              </button>
            ))}
          </div>

          <Link to="/login"
            className="inline-flex items-center justify-center gap-3 w-full sm:w-auto px-10 py-4 rounded-xl text-black font-extrabold text-sm uppercase tracking-widest transition-all hover:-translate-y-1 hover:shadow-[0_15px_30px_rgba(74,222,128,0.3)]"
            style={{ background: '#4ade80' }}>
            {t.ctaBtn}
            <ArrowRight size={18} />
          </Link>
        </motion.div>

        {/* Bottom Fade Mask */}
        <div className="absolute bottom-0 left-0 right-0 h-16"
          style={{ background: 'linear-gradient(to top, #060e07, transparent)', zIndex: 20 }} />
      </section>

      {/* ══════════════════════════════════════════════
          FOOTER — Full, improved from LandingFooter
      ══════════════════════════════════════════════ */}
      <footer className="relative z-10" style={{ background: '#060e07', borderTop: '1px solid rgba(74,222,128,0.08)' }}>
        <div className="max-w-7xl mx-auto px-6 md:px-16 pt-16 pb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-14">

            {/* Col 1 — Brand */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-11 h-11 rounded-xl bg-white p-1.5 flex items-center justify-center"
                  style={{ boxShadow: '0 0 20px rgba(74,222,128,0.15)' }}>
                  <img src="/logo.png" className="w-full h-full object-contain" alt="logo"
                    onError={e => { e.target.style.display = 'none'; }} />
                </div>
                <div>
                  <div className="font-black text-2xl text-white leading-none">Krishi<span className="text-green-400">AI</span></div>
                  <div className="font-mono-custom text-[7px] text-green-500/30 tracking-[0.3em] uppercase mt-0.5">
                    {lang === 'hi' ? 'किसान का साथी' : 'Smart Farming'}
                  </div>
                </div>
              </div>
              <p className="text-green-100/70 text-sm mb-2 font-medium">{t.footerTagline}</p>
              <p className="text-green-100/60 text-sm leading-relaxed mb-5">{t.footerDesc}</p>
              {/* Social */}
              <div className="flex gap-2">
                {[
                  { icon: <Github size={14} />, href: 'https://github.com' },
                  { icon: <Linkedin size={14} />, href: 'https://linkedin.com' },
                  { icon: <Globe size={14} />, href: '/' },
                  { icon: <Mail size={14} />, href: 'mailto:support@krishiai.online' },
                ].map((s, i) => (
                  <a key={i} href={s.href} target={s.href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer"
                    className="social-btn w-9 h-9 rounded-full flex items-center justify-center text-green-100/60 transition-all"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    {s.icon}
                  </a>
                ))}
              </div>
            </div>

            {/* Col 2 — Quick Links */}
            <div>
              <h4 className="text-white font-bold mb-5 text-sm uppercase tracking-widest font-mono-custom">{t.quickLinks}</h4>
              <div className="space-y-3">
                {[
                  { to: '/', label: lang === 'hi' ? 'होम' : 'Home' },
                  { to: '/dashboard', label: lang === 'hi' ? 'डैशबोर्ड' : 'Dashboard' },
                  { to: '/detection', label: lang === 'hi' ? 'रोग पहचान' : 'Disease Detection' },
                  { to: '/inventory', label: lang === 'hi' ? 'फसल इन्वेंटरी' : 'Crop Inventory' },
                  { to: '/weather', label: lang === 'hi' ? 'मौसम' : 'Weather' },
                ].map((l, i) => (
                  <Link key={i} to={l.to} className="footer-link block hover:text-green-400 transition-colors">{l.label}</Link>
                ))}
              </div>
            </div>

            {/* Col 3 — Company */}
            <div>
              <h4 className="text-white font-bold mb-5 text-sm uppercase tracking-widest font-mono-custom">{t.company}</h4>
              <div className="space-y-3">
                {[
                  { to: '/about', label: lang === 'hi' ? 'हमारे बारे में' : 'About' },
                  { to: '/team', label: lang === 'hi' ? 'टीम' : 'Team' },
                  { to: '/contact', label: lang === 'hi' ? 'संपर्क करें' : 'Contact' },
                  { to: '/privacy', label: lang === 'hi' ? 'गोपनीयता नीति' : 'Privacy Policy' },
                  { to: '/terms', label: lang === 'hi' ? 'सेवा की शर्तें' : 'Terms of Service' },
                ].map((l, i) => (
                  <Link key={i} to={l.to} className="footer-link block hover:text-green-400 transition-colors">{l.label}</Link>
                ))}
              </div>
            </div>

            {/* Col 4 — Contact */}
            <div>
              <h4 className="text-white font-bold mb-5 text-sm uppercase tracking-widest font-mono-custom">{t.contact}</h4>
              <div className="space-y-4">
                <div className="flex gap-3 items-start">
                  <Mail className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                  <span className="text-green-100/60 text-sm">support@krishiai.online</span>
                </div>
                <div className="flex gap-3 items-start">
                  <MapPin className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                  <span className="text-green-100/60 text-sm">
                    {lang === 'hi' ? 'भोपाल, मध्य प्रदेश, भारत' : lang === 'mr' ? 'भोपाळ, मध्य प्रदेश, भारत' : 'Bhopal, Madhya Pradesh, India'}
                  </span>
                </div>
                <div className="flex gap-3 items-start">
                  <Phone className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                  <span className="text-green-100/60 text-sm">+91 98765 43210</span>
                </div>
              </div>

              {/* Language switcher in footer */}
              <div className="mt-6">
                <div className="section-label mb-3">{lang === 'hi' ? 'भाषा चुनें' : 'Select Language'}</div>
                <div className="flex flex-wrap gap-1.5">
                  {Object.entries(LANGS).map(([k, v]) => (
                    <button key={k} onClick={() => { setLang(k); setLanguage(k); }}
                      className={`lang-pill text-[9px] px-2.5 py-1 ${lang === k ? 'active' : ''}`}>
                      {v.flag} {v.code}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Divider with plants */}
          <div className="relative border-t mb-6" style={{ borderColor: 'rgba(74,222,128,0.07)' }}>
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 flex gap-3 opacity-25">
              <Flower color="#4ade80" size={0.55} />
              <GrowingPlant size={0.5} />
              <Flower color="#fcd34d" size={0.55} />
            </div>
          </div>

          {/* Bottom bar */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-2 mb-3">
            <p className="text-green-100/50 text-xs font-mono-custom">© 2026 KrishiAI. {t.allRights}.</p>
            <p className="text-green-100/50 text-xs flex items-center gap-1.5">
              <Heart size={10} className="text-red-500/60" /> {t.madeWith}
            </p>
          </div>

          {/* Credit */}
          <p className="text-center font-mono-custom text-[10px] text-green-500/50 tracking-wider">
            ✦ Crafted with passion by Team Syntex Squad ✦
          </p>
        </div>
      </footer>

    </div>
  );
}