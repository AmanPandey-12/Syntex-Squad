import { createContext, useContext, useState, useEffect } from 'react';

// Top 5 Indian Languages: Hindi, Telugu, Tamil, Bengali, Marathi
const LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', flag: '🇮🇳' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', flag: '🇮🇳' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', flag: '🇮🇳' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', flag: '🇮🇳' },
];

// Comprehensive translation dictionary using simple farmer-friendly words
export const translations = {
  // ─── NAVBAR ───
  'nav.dashboard': {
    en: 'My Farm', hi: 'मेरा खेत', te: 'నా పొలం', ta: 'என் பண்ணை', bn: 'আমার খামার', mr: 'माझे शेत'
  },
  'nav.detection': {
    en: 'Detection', hi: 'बीमारी जांच', te: 'వ్యాధి గుర్తింపు', ta: 'நோய் கண்டறிதல்', bn: 'রোগ নির্ণয়', mr: 'रोग तपासणी'
  },
  'nav.inventory': {
    en: 'Inventory', hi: 'फसल भंडार', te: 'పంట జాబితా', ta: 'பயிர் சேமிப்பு', bn: 'ফসল ভাণ্ডার', mr: 'पीक साठा'
  },
  'nav.profile': {
    en: 'Profile', hi: 'प्रोफ़ाइल', te: 'ప్రొఫైల్', ta: 'சுயவிவரம்', bn: 'প্রোফাইল', mr: 'प्रोफाइल'
  },
  'nav.cropPicker': {
    en: 'Crop Picker', hi: 'फसल चयन', te: 'పంట ఎంపిక', ta: 'பயிர் தேர்வு', bn: 'ফসল নির্বাচন', mr: 'पीक निवड'
  },
  'nav.profitCalc': {
    en: 'Profit Calculator', hi: 'मुनाफा कैलकुलेटर', te: 'లాభం కాలిక్యులేటర్', ta: 'லாப கணிப்பான்', bn: 'লাভের হিসাব', mr: 'नफा कॅल्क्युलेटर'
  },
  'nav.about': {
    en: 'About', hi: 'हमारे बारे में', te: 'మా గురించి', ta: 'எங்களைப் பற்றி', bn: 'আমাদের সম্পর্কে', mr: 'आमच्याबद्दल'
  },
  'nav.logout': {
    en: 'Logout', hi: 'लॉगआउट', te: 'లాగ్ అవుట్', ta: 'வெளியேறு', bn: 'লগআউট', mr: 'लॉगआउट'
  },
  'nav.schemes': {
    en: 'Schemes', hi: 'सरकारी योजनाएं', te: 'ప్రభుత్వ పథకాలు', ta: 'அரசு திட்டங்கள்', bn: 'সরকারি প্রকল্প', mr: 'सरकारी योजना'
  },

  // ─── DASHBOARD ───
  'dash.goodMorning': {
    en: 'Good Morning', hi: 'सुप्रभात', te: 'శుభోదయం', ta: 'காலை வணக்கம்', bn: 'সুপ্রভাত', mr: 'सुप्रभात'
  },
  'dash.goodAfternoon': {
    en: 'Good Afternoon', hi: 'नमस्कार', te: 'శుభ మధ్యాహ్నం', ta: 'மதிய வணக்கம்', bn: 'শুভ অপরাহ্ন', mr: 'शुभ दुपार'
  },
  'dash.goodEvening': {
    en: 'Good Evening', hi: 'शुभ संध्या', te: 'శుభ సాయంత్రం', ta: 'மாலை வணக்கம்', bn: 'শুভ সন্ধ্যা', mr: 'शुभ संध्याकाळ'
  },
  'dash.subtitle': {
    en: 'Your farm at a glance', hi: 'आपकी खेती एक नज़र में', te: 'మీ పొలం ఒక చూపులో', ta: 'உங்கள் பண்ணை ஒரு பார்வையில்', bn: 'আপনার খামার এক নজরে', mr: 'तुमची शेती एका नजरेत'
  },
  'dash.scanCrop': {
    en: 'Scan Crop', hi: 'फसल स्कैन करें', te: 'పంట స్కాన్ చేయండి', ta: 'பயிர் ஸ்கேன்', bn: 'ফসল স্ক্যান করুন', mr: 'पीक स्कॅन करा'
  },
  'dash.viewInventory': {
    en: 'View Inventory', hi: 'भंडार देखें', te: 'జాబితా చూడండి', ta: 'சேமிப்பு பார்க்க', bn: 'ভাণ্ডার দেখুন', mr: 'साठा बघा'
  },
  'dash.totalCrops': {
    en: 'Total Crops', hi: 'कुल फसलें', te: 'మొత్తం పంటలు', ta: 'மொத்த பயிர்கள்', bn: 'মোট ফসল', mr: 'एकूण पिके'
  },
  'dash.healthyCrops': {
    en: 'Healthy Crops', hi: 'स्वस्थ फसलें', te: 'ఆరోగ్యకరమైన పంటలు', ta: 'ஆரோக்கிய பயிர்கள்', bn: 'সুস্থ ফসল', mr: 'निरोगी पिके'
  },
  'dash.diseasedCrops': {
    en: 'Diseased Crops', hi: 'रोगी फसलें', te: 'వ్యాధిగ్రస్త పంటలు', ta: 'நோயுற்ற பயிர்கள்', bn: 'রোগাক্রান্ত ফসল', mr: 'रोगग्रस्त पिके'
  },
  'dash.avgHealth': {
    en: 'Average Health', hi: 'औसत स्वास्थ्य', te: 'సగటు ఆరోగ్యం', ta: 'சராசரி ஆரோக்கியம்', bn: 'গড় স্বাস্থ্য', mr: 'सरासरी आरोग्य'
  },
  'dash.weather': {
    en: 'Weather', hi: 'मौसम', te: 'వాతావరణం', ta: 'வானிலை', bn: 'আবহাওয়া', mr: 'हवामान'
  },
  'dash.recentScans': {
    en: 'Recent Scans', hi: 'हालिया स्कैन', te: 'ఇటీవలి స్కాన్‌లు', ta: 'சமீபத்திய ஸ்கேன்', bn: 'সাম্প্রতিক স্ক্যান', mr: 'अलीकडील स्कॅन'
  },
  'dash.quickActions': {
    en: 'Quick Actions', hi: 'जल्दी कार्य', te: 'శీఘ్ర చర్యలు', ta: 'விரைவு நடவடிக்கைகள்', bn: 'দ্রুত কার্যক্রম', mr: 'जलद क्रिया'
  },
  'dash.mandiPrices': {
    en: 'Market Prices', hi: 'मंडी भाव', te: 'మార్కెట్ ధరలు', ta: 'சந்தை விலைகள்', bn: 'বাজার দর', mr: 'बाजार भाव'
  },
  'dash.cropAdvice': {
    en: 'Crop Advice', hi: 'फसल सलाह', te: 'పంట సలహా', ta: 'பயிர் ஆலோசனை', bn: 'ফসলের পরামর্শ', mr: 'पीक सल्ला'
  },
  'dash.searchMarket': {
    en: 'Search Mandi...', hi: 'मंडी खोजें...', te: 'మార్కెట్ వెతకండి...', ta: 'சந்தையைத் தேடு...', bn: 'বাজার খুঁজুন...', mr: 'बाजार शोधा...'
  },
  'dash.live': {
    en: 'LIVE', hi: 'लाइव', te: 'లైవ్', ta: 'நேரடி', bn: 'লাইভ', mr: 'थेट'
  },
  'dash.sample': {
    en: 'SAMPLE', hi: 'नमूना', te: 'నమూనా', ta: 'மாதிரி', bn: 'নমুনা', mr: 'नमुना'
  },
  'dash.total': {
    en: 'Total', hi: 'कुल', te: 'మొత్తం', ta: 'மொத்தம்', bn: 'মোট', mr: 'एकूण'
  },
  'dash.alerts': {
    en: 'Alerts', hi: 'सूचना', te: 'అలర్ట్లు', ta: 'எச்சரிக்கைகள்', bn: 'সতর্কতা', mr: 'सूचना'
  },
  'dash.temp': {
    en: 'Temp', hi: 'तापमान', te: 'ఉష్ణోగ్రత', ta: 'வெப்பநிலை', bn: 'তাপমাত্রা', mr: 'तापमान'
  },
  'dash.season': {
    en: 'Season', hi: 'मौसम/रबी', te: 'సీజన్', ta: 'பருவம்', bn: 'ঋতু', mr: 'हंगाम'
  },
  'dash.cropCalendar': {
    en: 'Crop Calendar', hi: 'फसल कैलेंडर', te: 'పంట క్యాలెండర్', ta: 'பயிர் காலண்டர்', bn: 'ফসলের ক্যালেন্ডার', mr: 'पीक कॅलेंडर'
  },
  'dash.profitHisaab': {
    en: 'Profit & Loss', hi: 'कमाई का हिसाब', te: 'లాభ నష్టాలు', ta: 'லாப நஷ்டம்', bn: 'লাভ ও লোকসান', mr: 'नफा तोटा'
  },
  'dash.aiAssistant': {
    en: 'AI Assistant', hi: 'AI सहायक', te: 'AI సహాయకుడు', ta: 'AI உதவியாளர்', bn: 'AI সহকারী', mr: 'AI सहाय्यक'
  },
  'dash.community': {
    en: 'Community', hi: 'किसान नेटवर्क', te: 'కమ్యూనిటీ', ta: 'சமூகம்', bn: 'সম্প্রদায়', mr: 'समुदाय'
  },
  'dash.plantingGuide': {
    en: 'Planting Guide', hi: 'बुवाई गाइड', te: 'నాటడం గైడ్', ta: 'நடவு வழிகாட்டி', bn: 'রোপণ গাইড', mr: 'लागवड मार्गदर्शक'
  },
  'dash.askAnything': {
    en: 'Ask anything', hi: 'कुछ भी पूछें', te: 'ఏదైనా అడగండి', ta: 'எதுவும் கேளுங்கள்', bn: 'যেকোনো কিছু জিজ্ঞাসা করুন', mr: 'काहीही विचारा'
  },
  'dash.liveNetwork': {
    en: 'Farmer Network', hi: 'किसान भाई-चारा', te: 'రైతు నెట్‌వర్క్', ta: 'விவசாயி நெட்வொர்க்', bn: 'কৃষক নেটওয়ার্ক', mr: 'शेतकरी नेटवर्क'
  },

  // ─── DETECTION PAGE ───
  'det.title': {
    en: 'Check Crop Health', hi: 'फसल की जांच', te: 'పంట ఆరోగ్యం తనిఖీ', ta: 'பயிர் ஆரோக்கியம் சரிபார்ப்பு', bn: 'ফসল পরীক্ষা', mr: 'पीक तपासणी'
  },
  'det.subtitle': {
    en: 'Upload or capture a photo of your crop leaf', hi: 'अपनी फसल की पत्ती की फोटो डालें', te: 'మీ పంట ఆకు ఫోటో అప్‌లోడ్ చేయండి', ta: 'உங்கள் பயிர் இலை புகைப்படத்தை பதிவேற்றுங்கள்', bn: 'আপনার ফসলের পাতার ছবি আপলোড করুন', mr: 'आपल्या पिकाच्या पानाचा फोटो टाका'
  },
  'det.upload': {
    en: 'Upload Image', hi: 'फोटो डालें', te: 'ఫోటో అప్‌లోడ్', ta: 'புகைப்படம் பதிவேற்று', bn: 'ছবি আপলোড', mr: 'फोटो टाका'
  },
  'det.capture': {
    en: 'Take Photo', hi: 'फोटो खींचें', te: 'ఫోటో తీయండి', ta: 'புகைப்படம் எடு', bn: 'ছবি তুলুন', mr: 'फोटो काढा'
  },
  'det.analyze': {
    en: 'Analyze Crop', hi: 'फसल जांचें', te: 'పంట విశ్లేషించండి', ta: 'பயிர் பகுப்பாய்வு', bn: 'ফসল বিশ্লেষণ', mr: 'पीक तपासा'
  },
  'det.analyzing': {
    en: 'Analyzing...', hi: 'जांच हो रही है...', te: 'విశ్లేషిస్తోంది...', ta: 'பகுப்பாய்வு செய்கிறது...', bn: 'বিশ্লেষণ হচ্ছে...', mr: 'तपासणी होत आहे...'
  },
  'det.result': {
    en: 'What we found', hi: 'जांच का नतीजा', te: 'మేము కనుగొన్నది', ta: 'நாங்கள் கண்டறிந்தது', bn: 'আমরা যা পেয়েছি', mr: 'आम्हाला काय आढळले'
  },
  'det.healthy': {
    en: 'Healthy', hi: 'स्वस्थ', te: 'ఆరోగ్యకరం', ta: 'ஆரோக்கியமான', bn: 'সুস্থ', mr: 'निरोगी'
  },
  'det.diseased': {
    en: 'Diseased', hi: 'रोगी', te: 'వ్యాధిగ్రస్తం', ta: 'நோயுற்ற', bn: 'রোগাক্রান্ত', mr: 'रोगग्रस्त'
  },
  'det.saveCrop': {
    en: 'Save to Inventory', hi: 'भंडार में सेव करें', te: 'జాబితాలో సేవ్ చేయండి', ta: 'சேமிப்பில் சேமிக்கவும்', bn: 'ভাণ্ডারে সংরক্ষণ করুন', mr: 'साठ्यात जतन करा'
  },
  'det.newScan': {
    en: 'New Scan', hi: 'नया स्कैन', te: 'కొత్త స్కాన్', ta: 'புதிய ஸ்கேன்', bn: 'নতুন স্ক্যান', mr: 'नवीन स्कॅन'
  },
  'det.confidence': {
    en: 'Confidence', hi: 'विश्वास', te: 'నమ్మకం', ta: 'நம்பகத்தன்மை', bn: 'আত্মবিশ্বাস', mr: 'विश्वासार्हता'
  },
  'det.healthIndex': {
    en: 'Health Score', hi: 'स्वास्थ्य स्कोर', te: 'ఆరోగ్య స్కోరు', ta: 'ఆరోగ్య மதிப்பெண்', bn: 'স্বাস্থ্য স্কোর', mr: 'आरोग्य स्कोर'
  },
  'det.preciseSolution': {
    en: 'How to Fix It', hi: 'इसे ठीक कैसे करें', te: 'దీన్ని ఎలా పరిష్కరించాలి', ta: 'இதை எப்படி சரி செய்வது', bn: 'কিভাবে ঠিক করবেন', mr: 'हे कसे ठीक करायचे'
  },
  'det.nutrientProtocol': {
    en: 'Fertilizer Advice', hi: 'खाद की सलाह', te: 'ఎరువుల సలహా', ta: 'உரம் ஆலோசனை', bn: 'সারের পরামর্শ', mr: 'खताचा सल्ला'
  },
  'det.protectionProtocol': {
    en: 'Pest Control', hi: 'कीटनाशक सलाह', te: 'పురుగుమందుల సలహా', ta: 'பூச்சிக்கொல்லி ஆலோசனை', bn: 'কীটনাশক পরামর্শ', mr: 'कीटकनाशक सल्ला'
  },
  'det.preventionProtocol': {
    en: 'Stop Future Problems', hi: 'आगे बचाव के उपाय', te: 'ముందు జాగ్రత్తలు', ta: 'முன்னెచ్చరిక చర్యలు', bn: 'ভবিষ্যত সমস্যা রোধ', mr: 'पुढील प्रतिबंधात्मक उपाय'
  },
  'det.researchLabel': {
    en: 'Assign Research Label (optional)', hi: 'लेबल लगायें (वैकल्पिक)', te: 'లేబుల్‌ను కేటాయించండి (ఐచ్ఛికం)', ta: 'லேபிளை ஒதுக்கவும் (விருப்பமானது)', bn: 'লেবেল বরাদ্দ করুন (ঐচ্ছিক)', mr: 'लेबल लावा (पर्यायी)'
  },
  'det.saveFieldLog': {
    en: 'Save to Field Log', hi: 'लॉग में सहेजें', te: 'ఫీల్డ్ లాగ్‌లో సేవ్ చేయండి', ta: 'பதிவில் சேமிக்கவும்', bn: 'লগ সংরক্ষণ করুন', mr: 'लॉगमध्ये जतन करा'
  },
  'det.successfullyIntegrated': {
    en: 'Successfully Integrated', hi: 'सफलतापूर्वक जोड़ा गया', te: 'విజయవంతంగా అనుసంధానించబడింది', ta: 'வெற்றிகரமாக ஒருங்கிணைக்கப்பட்டது', bn: 'সফলভাবে যুক্ত করা হয়েছে', mr: 'यशस्वीरित्या जोडले गेले'
  },
  'det.redirecting': {
    en: 'Redirecting to dashboard…', hi: 'पेज पर वापस जा रहे हैं...', te: 'డాష్‌బోర్డ్ వైపు మళ్ళిస్తోంది…', ta: 'முகப்பு பக்கத்திற்கு செல்கிறது...', bn: 'ড্যাশবোর্ডে ফিরে যাচ্ছি…', mr: 'मुख्यपृष्ठावर परत जात आहे...'
  },
  'det.scannedLeaf': {
    en: 'Scanned Leaf', hi: 'स्कैन की गई पत्ती', te: 'స్కాన్ చేసిన ఆకు', ta: 'ஸ்கேன் செய்யப்பட்ட இலை', bn: 'স্ক্যান করা পাতা', mr: 'स्कॅन केलेले पान'
  },
  'det.neuralSensorIdle': {
    en: 'No photo chosen', hi: 'कोई फोटो नहीं चुनी गई', te: 'ఫోటో ఎంచుకోబడలేదు', ta: 'புகைப்படம் தேர்ந்தெடுக்கப்படவில்லை', bn: 'কোনো ছবি চয়ন করা হয়নি', mr: 'फोटो निवडलेला नाही'
  },
  'det.analyzingLeaf': {
    en: 'Analysing leaf…', hi: 'पत्ती की जांच हो रही है...', te: 'ఆకును విశ్లేషిస్తోంది...', ta: 'இலை ஆராய்கிறது...', bn: 'পাতা বিশ্লেষণ করা হচ্ছে...', mr: 'पानाची तपासणी होत आहे...'
  },
  'det.comparingDatabase': {
    en: 'Comparing with database…', hi: 'डेटाबेस से तुलना...', te: 'డేటాబేస్‌తో పోల్చుతోంది...', ta: 'தரவுத்தளத்துடன் ஒப்பிடுகிறது...', bn: 'ডেটাবেসের সাথে তুলনা করা হচ্ছে...', mr: 'डेटाबेसशी तुलना होत आहे...'
  },
  'det.generatingReport': {
    en: 'Generating report…', hi: 'रिपोर्ट बनाई जा रही है...', te: 'నివేదికను రూపొందిస్తోంది...', ta: 'அறிக்கை உருவாக்குகிறது...', bn: 'রিপোর্ট তৈরি করা হচ্ছে...', mr: 'अहवाल तयार होत आहे...'
  },
  'det.uploadPhoto': {
    en: 'Upload Photo', hi: 'फोटो अपलोड करें', te: 'ఫోటో అప్‌లోడ్ చేయండి', ta: 'புகைப்படத்தை பதிவேற்றவும்', bn: 'ছবি আপলোড করুন', mr: 'फोटो अपलोड करा'
  },
  'det.takePhoto': {
    en: 'Take Photo', hi: 'फोटो खींचें', te: 'ఫోोटो తీయండి', ta: 'புகைப்படம் எடுக்கவும்', bn: 'ছবি তুলুন', mr: 'फोटो काढा'
  },
  'det.fieldHealthScanner': {
    en: 'Crop Checker', hi: 'फसल की जांच', te: 'పంట తనిఖీ', ta: 'பயிர் சரிபார்ப்பு', bn: 'ফসল চ্যাকার', mr: 'पीक तपासणी'
  },
  'det.selectBioImagery': {
    en: 'Choose Photo', hi: 'फोटो चुनें', te: 'ఫోటో ఎంచుకోండి', ta: 'புகைப்படத்தைத் தேர்ந்தெடுக்கவும்', bn: 'ছবি নির্বাচন করুন', mr: 'फोटो निवडा'
  },
  'det.defenseStrategy': {
    en: 'Defense Strategy', hi: 'बचाव रणनीति', te: 'రక్షణ వ్యూహం', ta: 'பாதுகாப்பு உத்தி', bn: 'প্রতিরক্ষা কৌশল', mr: 'बचाव धोरण'
  },
  'det.errSave': {
    en: 'Failed to save result to cloud.', hi: 'क्लाउड में सेव नहीं हो सका।', te: 'క్లౌడ్‌లో సేవ్ చేయడం విఫలమైంది.', ta: 'கிளவுட்டில் சேமிக்க முடியவில்லை.', bn: 'ক্লাউডে সংরক্ষণ করতে ব্যর্থ হয়েছে।', mr: 'क्लाउडमध्ये जतन करण्यात अपयश आले.'
  },
  'det.errGeneric': {
    en: 'An error occurred.', hi: 'एक गलती हुई।', te: 'ఒక లోపం సంభవించింది.', ta: 'ஒரு பிழை ஏற்பட்டது.', bn: 'একটি ত্রুটি ঘটেছে।', mr: 'एक त्रुटी आली.'
  },
  'det.errOffline': {
    en: 'Storage system offline. Firebase config missing.', hi: 'सिस्टम ऑफलाइन है।', te: 'స్టోరేజ్ సిస్టమ్ ఆఫ్‌లైన్‌లో ఉంది.', ta: 'சேமிப்பக அமைப்பு ஆஃப்லைனில் உள்ளது.', bn: 'স্টোরেজ সিস্টেম অফলাইন।', mr: 'सिस्टम ऑफलाइन आहे.'
  },
  'det.errSignIn': {
    en: 'Please sign in to save results.', hi: 'नतीजे सेव करने के लिए साइन इन करें।', te: 'ఫలితాలను సేవ్ చేయడానికి దయచేసి సైన్ ఇన్ చేయండి.', ta: 'முடிவுகளைச் சேமிக்க உள்நுழையவும்.', bn: 'ফলাফল সংরক্ষণ করতে সাইন ইন করুন।', mr: 'निकाल जतन करण्यासाठी साइन इन करा.'
  },
  'det.scanFailed': {
    en: 'Scan Failed', hi: 'जांच विफल रही', te: 'స్కాన్ విఫలమైంది', ta: 'ஸ்கேன் தோல்வியடைந்தது', bn: 'স্ক্যান ব্যর্থ হয়েছে', mr: 'स्कॅन अयशस्वी'
  },
  'det.medicine': {
    en: 'Recommended Medicine', hi: 'अनुशंसित दवाई (Medicine)', te: 'సూచించిన మందు', ta: 'பரிந்துரைக்கப்பட்ட மருந்து', bn: 'প্রস্তাবিত ঔষধ', mr: 'शिफारस केलेले औषध'
  },
  'det.deepAnalysis': {
    en: 'Clinical Analysis', hi: 'गहन जांच (Deep Analysis)', te: 'లోతైన విశ్లేషణ', ta: 'ஆழ்ந்த பகுப்பாய்வு', bn: 'গভীর বিশ্লেষণ', mr: 'सखोल विश्लेषण'
  },
  'det.trueHealth': {
    en: 'True Health Index', hi: 'सटीक स्वास्थ्य सूचकांक', te: 'ఖచ్చితమైన ఆరోగ్య సూచిక', ta: 'துல்லியமான ఆరోగ్య குறியீடு', bn: 'সঠিক স্বাস্থ্য সূচক', mr: 'अचूक आरोग्य निर्देशांक'
  },

  // ─── INVENTORY PAGE ───
  'inv.title': {
    en: 'My Crop Inventory', hi: 'मेरा फसल भंडार', te: 'నా పంట జాబితా', ta: 'எனது பயிர் சேமிப்பு', bn: 'আমার ফসল ভাণ্ডার', mr: 'माझा पीक साठा'
  },
  'inv.search': {
    en: 'Search crops...', hi: 'फसल खोजें...', te: 'పంటలు వెతకండి...', ta: 'பயிர்களைத் தேடு...', bn: 'ফসল খুঁজুন...', mr: 'पिके शोधा...'
  },
  'inv.nocrops': {
    en: 'No crops found', hi: 'कोई फसल नहीं मिली', te: 'పంటలు కనుగొనబడలేదు', ta: 'பயிர்கள் இல்லை', bn: 'কোনো ফসল পাওয়া যায়নি', mr: 'पिके सापडली नाहीत'
  },
  'inv.calcHistory': {
    en: 'Past Records', hi: 'पुराना रिकॉर्ड', te: 'పాత రికార్డులు', ta: 'பழைய பதிவுகள்', bn: 'পুরানো রেকর্ড', mr: 'जुना रेकॉर्ड'
  },
  'inv.healthy': {
    en: 'Healthy', hi: 'स्वस्थ', te: 'ఆరోగ్యకరం', ta: 'ஆரோக்கியம்', bn: 'সুস্থ', mr: 'निरोगी'
  },
  'inv.atRisk': {
    en: 'At Risk', hi: 'खतरे में', te: 'ప్రమాదంలో', ta: 'ஆபத்தில்', bn: 'ঝুঁকিতে', mr: 'धोक्यात'
  },
  'inv.all': {
    en: 'All', hi: 'सभी', te: 'అన్నీ', ta: 'அனைத்தும்', bn: 'সকল', mr: 'सर्व'
  },
  'inv.searchPlaceholder': {
    en: 'Search by name...', hi: 'नाम से खोजें...', te: 'పేరుతో వెతకండి...', ta: 'பெயரால் தேடு...', bn: 'নাম দিয়ে খুঁজুন...', mr: 'नावाने शोधा...'
  },
  'inv.latestFirst': {
    en: 'Latest First', hi: 'नवीनतम पहले', te: 'తాజావి ముందు', ta: 'சமீபத்தியவை முதலில்', bn: 'সাম্প্রতিক আগে', mr: 'नवीनतम आधी'
  },
  'inv.healthHigh': {
    en: 'Health: High to Low', hi: 'स्वास्थ्य: ज़्यादा से कम', te: 'ఆరోగ్యం: ఎక్కువ నుండి తక్కువ', ta: 'ஆரோக்கியம்: அதிகம் முதல் குறைவு', bn: 'স্বাস্থ্য: বেশি থেকে কম', mr: 'आरोग्य: जास्त ते कमी'
  },
  'inv.healthLow': {
    en: 'Health: Low to High', hi: 'स्वास्थ्य: कम से ज़्यादा', te: 'ఆరోగ్యం: తక్కువ నుండి ఎక్కువ', ta: 'ஆரோக்கியம்: குறைவு முதல் அதிகம்', bn: 'স্বাস্থ্য: কম থেকে বেশি', mr: 'आरोग्य: कमी ते जास्त'
  },
  'inv.oldestFirst': {
    en: 'Oldest First', hi: 'सबसे पुराना पहले', te: 'పాతవి ముందు', ta: 'பழையவை முதலில்', bn: 'পুরানো আগে', mr: 'जुने आधी'
  },
  'inv.loading': {
    en: 'Loading your crops...', hi: 'फसलें लोड हो रहीं...', te: 'పంటలు లోడ్ అవుతున్నాయి...', ta: 'பயிர்கள் ஏற்றப்படுகின்றன...', bn: 'ফসল লোড হচ্ছে...', mr: 'पिके लोड होत आहेत...'
  },
  'inv.noCropsTitle': {
    en: 'No crops found', hi: 'कोई फसल नहीं मिली', te: 'పంటలు కనుగొనబడలేదు', ta: 'பயிர்கள் இல்லை', bn: 'কোনো ফসল পাওয়া যায়নি', mr: 'पिके सापडली नाहीत'
  },
  'inv.noCropsSub': {
    en: 'Run your first diagnosis to get started.', hi: 'शुरू करने के लिए पहली जांच करें।', te: 'ప్రారంభించడానికి మొదటి పరీక్ష చేయండి.', ta: 'தொடங்க முதல் பரிசோதனை செய்யுங்கள்.', bn: 'শুরু করতে প্রথম পরীক্ষা করুন।', mr: 'सुरू करण्यासाठी पहिली तपासणी करा.'
  },
  'inv.runDiagnosis': {
    en: 'Check Health', hi: 'सेहत जांचें', te: 'ఆరోగ్యాన్ని తనిఖీ చేయండి', ta: 'ஆரோக்கியத்தை சரிபார்க்கவும்', bn: 'স্বাস্থ্য পরীক্ষা করুন', mr: 'आरोग्य तपासा'
  },
  'inv.details': {
    en: 'Details', hi: 'विवरण', te: 'వివరాలు', ta: 'விவரங்கள்', bn: 'বিস্তারিত', mr: 'तपशील'
  },
  'inv.health': {
    en: 'Health', hi: 'स्वास्थ्य', te: 'ఆరోగ్యం', ta: 'ஆரோக்கியம்', bn: 'স্বাস্থ্য', mr: 'आरोग्य'
  },
  'inv.stable': {
    en: 'Health is Same', hi: 'सेहत वैसी ही है', te: 'ఆరోగ్యం అలాగే ఉంది', ta: 'ஆரோக்கியம் மாற்றமில்லை', bn: 'স্বাস্থ্য একই রকম', mr: 'आरोग्य तसेच आहे'
  },
  'inv.better': {
    en: 'Health is Better', hi: 'सेहत में सुधार है', te: 'ఆరోగ్యం బాगुంది', ta: 'ஆரோக்கியம் நல்லது', bn: 'স্বাস্থ্য ভালো', mr: 'आरोग्य सुधारले आहे'
  },
  'inv.worse': {
    en: 'Health is Low', hi: 'सेहत गिर रही है', te: 'ఆరోగ్యం తగ్గింది', ta: 'ஆரோக்கியம் குறைவு', bn: 'স্বাস্থ্য কম', mr: 'आरोग्य खालावले आहे'
  },
  'inv.fromLastScan': {
    en: 'from last scan', hi: 'पिछले स्कैन से', te: 'చివరి స్కాన్ నుండి', ta: 'கடைசி ஸ்கேனிலிருந்து', bn: 'শেষ স্ক্যান থেকে', mr: 'शेवटच्या स्कॅनपासून'
  },
  'inv.delete': {
    en: 'Delete this crop?', hi: 'क्या इस फसल को मिटाएं?', te: 'ఈ పంటను తొలగించాలా?', ta: 'இந்த பயிரை நீக்கவா?', bn: 'এই ফসল মুছবেন?', mr: 'हे पीक हटवायचे?'
  },
  'inv.reScan': {
    en: 'Re-Scan', hi: 'फिर स्कैन', te: 'మళ్ళీ స్కాన్', ta: 'மீண்டும் ஸ்கேன்', bn: 'পুনরায় স্ক্যান', mr: 'पुन्हा स्कॅन'
  },
  'inv.diagnosis': {
    en: 'Problem', hi: 'बीमारी/समस्या', te: 'సమస్య', ta: 'பிரச்சனை', bn: 'সমস্যা', mr: 'समस्या'
  },
  'inv.lastScanned': {
    en: 'Last scanned:', hi: 'अंतिम स्कैन:', te: 'చివరి స్కాన్:', ta: 'கடைசி ஸ்கேன்:', bn: 'শেষ স্ক্যান:', mr: 'शेवटचा स्कॅन:'
  },
  'inv.scanHistory': {
    en: 'Scan History', hi: 'स्कैन इतिहास', te: 'స్కాన్ చరిత్ర', ta: 'ஸ்கேன் வரலாறு', bn: 'স্ক্যান ইতিহাস', mr: 'स्कॅन इतिहास'
  },
  'inv.vitalityTrend': {
    en: 'Health Chart', hi: 'स्वास्थ्य चार्ट', te: 'ఆరోగ్య చార్ట్', ta: 'ஆరోగ్య விளக்கப்படம்', bn: 'স্বাস্থ্য চার্ট', mr: 'आरोग्य तक्ता'
  },
  'inv.solutionSteps': {
    en: 'How to fix it', hi: 'इलाज के तरीके', te: 'ఎలా పరిష్కరించాలి', ta: 'எப்படி சரி செய்வது', bn: 'কিভাবে সমাধান করবেন', mr: 'कसे ठीक करायचे'
  },
  'inv.preventionSteps': {
    en: 'How to stop it', hi: 'बचाव के तरीके', te: 'ఎలా ఆపాలి', ta: 'எப்படி தடுப்பது', bn: 'কিভাবে প্রতিরোধ করবেন', mr: 'কसे थांबवायचे'
  },
  'inv.recommendedAction': {
    en: 'What to do now', hi: 'अभी क्या करें', te: 'ఇప్పుడు ఏమి చేయాలి', ta: 'இப்போது என்ன செய்ய வேண்டும்', bn: 'এখন কি করতে হবে', mr: 'आता काय करायचे'
  },
  'inv.preventionProtocol': {
    en: 'Prevention Advice', hi: 'बचाव के उपाय', te: 'ముందు జాగ్రత్తలు', ta: 'முன்னெச்சரிக்கை ஆலோசனை', bn: 'প্রতিরোধের পরামর্শ', mr: 'प्रतिबंधात्मक सल्ला'
  },
  'inv.nextScan': {
    en: 'Next scan:', hi: 'अगला स्कैन:', te: 'తదుపరి స్కాన్:', ta: 'அடுத்த ஸ்கேன்:', bn: 'পরবর্তী ஸ்க্যান:', mr: 'पुढील स्कॅन:'
  },
  'inv.healthCert': {
    en: 'Plant Health Certificate', hi: 'फसल स्वास्थ्य प्रमाण पत्र', te: 'పంట ఆరోగ్య ధృవీకరణ పత్రం', ta: 'பயிர் சுகாதார சான்றிதழ்', bn: 'উদ্ভিদ স্বাস্থ্য শংসাপত্র', mr: 'पीक आरोग्य प्रमाणपत्र'
  },
  'inv.officialReport': {
    en: 'Official KrishiAI Biological Report', hi: 'आधिकारिक कृषि-AI जैविक रिपोर्ट', te: 'అధికారిక కృషి-AI బయోలాజికల్ రిపోర్ట్', ta: 'அதிகாரப்பூர்வ கிருஷி-AI உயிரியல் அறிக்கை', bn: 'অফিসিয়াল কৃষি-AI জৈবিক রিপোর্ট', mr: 'अधिकृत KrishiAI जैविक अहवाल'
  },
  'inv.cropId': {
    en: 'Crop Identification', hi: 'फसल की पहचान', te: 'పంట గుర్తింపు', ta: 'பயிர் அடையாளம்', bn: 'ফসল সনাক্তকরণ', mr: 'पीक ओळख'
  },
  'inv.severity': {
    en: 'Severity', hi: 'गंभीरता', te: 'తీవ్రత', ta: 'தீவிரம்', bn: 'তীব্রতা', mr: 'तीव्रता'
  },
  'inv.medicalProtocol': {
    en: 'Medical & Nutritional Protocol', hi: 'चिकित्सा और पोषण रिपोर्ट', te: 'వైద్య మరియు పోషక ప్రోటోకాల్', ta: 'மருத்துவ மற்றும் ஊட்டச்சத்து நெறிமுறை', bn: 'চিকিৎসা ও পুষ্টির প্রোটোকল', mr: 'वैद्यकीय आणि पोषण अहवाल'
  },
  'inv.vitalityIndex': {
    en: 'Vitality Index', hi: 'जीवन शक्ति सूचकांक', te: 'వైటాలిటీ ఇండెక్స్', ta: 'உயிர்ச்சக்தி குறியீடு', bn: 'প্রাণশক্তি সূচক', mr: 'जोम निर्देशांक'
  },
  'inv.close': {
    en: 'Close', hi: 'बंद करें', te: 'మూసివేయండి', ta: 'மூடு', bn: 'বন্ধ করুন', mr: 'बंद करा'
  },
  'inv.goBack': {
    en: 'Go Back', hi: 'वापस जाएं', te: 'వెనుకకు', ta: 'பின் செல்', bn: 'ফিরে যান', mr: 'मागे जा'
  },
  'inv.uploadPhoto': {
    en: 'Upload leaf or field photo', hi: 'पत्ती या खेत की फोटो डालें', te: 'ఆకు లేదా పొలం ఫోటో అప్‌లోడ్', ta: 'இலை அல்லது வயல் புகைப்படம் பதிவேற்று', bn: 'পাতা বা ক্ষেতের ছবি আপলোড', mr: 'पान किंवा शेताचा फोटो टाका'
  },
  'inv.readyToScan': {
    en: 'Ready to scan', hi: 'स्कैन के लिए तैयार', te: 'స్కాన్ చేయడానికి సిద్ధం', ta: 'ஸ்கேன் செய்ய தயார்', bn: 'স্ক্যান করতে প্রস্তুত', mr: 'स्कॅनसाठी तयार'
  },
  'inv.scanComplete': {
    en: 'Scan Complete', hi: 'स्कैन पूरा', te: 'స్కాన్ పూర్తయింది', ta: 'ஸ்கேன் முடிந்தது', bn: 'স্ক্যান সম্পন্ন', mr: 'स्कॅन पूर्ण'
  },
  'inv.before': {
    en: 'Before', hi: 'पहले', te: 'ముందు', ta: 'முன்', bn: 'আগে', mr: 'आधी'
  },
  'inv.after': {
    en: 'After', hi: 'बाद', te: 'తర్వాత', ta: 'பின்', bn: 'পরে', mr: 'नंतर'
  },
  'inv.improvement': {
    en: 'improvement', hi: 'सुधार', te: 'మెరుగుదల', ta: 'முன்னேற்றம்', bn: 'উন্নতি', mr: 'सुधार'
  },
  'inv.decline': {
    en: 'decline', hi: 'गिरावट', te: 'తగ్గుదల', ta: 'சரிவு', bn: 'অবনতি', mr: 'घसरण'
  },
  'inv.stage1': {
    en: 'Uploading image…', hi: 'फोटो डाला जा रहा है...', te: 'చిత్రం అప్‌లోడ్ అవుతోంది…', ta: 'படம் பதிவேற்றப்படுகிறது…', bn: 'ছবি আপলোড হচ্ছে…', mr: 'फोटो अपलोड होत आहे...'
  },
  'inv.stage2': {
    en: 'Analysing leaf texture…', hi: 'पत्ती की जांच हो रही है...', te: 'ఆకు ఆకృతిని విశ్లేషిస్తోంది…', ta: 'இலை அமைப்பை ஆராய்கிறது…', bn: 'পাতার গঠন বিশ্লেষণ করা হচ্ছে…', mr: 'पानांच्या पोतचे विश्लेषण करत आहे...'
  },
  'inv.stage3': {
    en: 'Comparing with database…', hi: 'डेटाबेस से तुलना...', te: 'డేటాబేస్‌తో పోల్చుతోంది…', ta: 'தரவுத்தளத்துடன் ஒப்பிடுகிறது…', bn: 'ডেটাবেসের সাথে তুলনা করা হচ্ছে…', mr: 'डेटाबेसशी तुलना करत आहे...'
  },
  'inv.stage4': {
    en: 'Generating bilingual report…', hi: 'रिपोर्ट बनाई जा रही है...', te: 'నివేదికను రూపొందిస్తోంది…', ta: 'அறிக்கையினை உருவாக்குகிறது…', bn: 'রিপোর্ট তৈরি করা হচ্ছে…', mr: 'अहवाल तयार करत आहे...'
  },
  'inv.previous': {
    en: 'Previous', hi: 'पिछला', te: 'మునుపటి', ta: 'முந்தைய', bn: 'পূর্ববর্তী', mr: 'मागील'
  },
  'inv.newScore': {
    en: 'New Score', hi: 'नया स्कोर', te: 'కొత్త స్కోర్', ta: 'புதிய மதிப்பெண்', bn: 'নতুন স্কোর', mr: 'नवीन स्कोर'
  },
  'inv.saveUpdate': {
    en: 'Save', hi: 'सहेजें', te: 'సేవ్ చేయండి', ta: 'சேமி', bn: 'সংরক্ষণ', mr: 'जतन करा'
  },
  'inv.downloadReport': {
    en: 'Download Report', hi: 'रिपोर्ट डाउनलोड', te: 'నివేదిక డౌన్‌లోడ్', ta: 'அறிக்கை பதிவிறக்கம்', bn: 'রিপোর্ট ডাউনলোড', mr: 'अहवाल डाउनलोड'
  },
  'inv.discard': {
    en: 'Discard', hi: 'रद्द करें', te: 'రద్దు', ta: 'நிராகரி', bn: 'বাতিল', mr: 'रद्द करा'
  },
  'inv.noCalcFound': {
    en: 'No calculations found', hi: 'कोई गणना नहीं मिली', te: 'గణనలు కనుగొనబడలేదు', ta: 'கணக்கீடுகள் இல்லை', bn: 'কোনো গণনা পাওয়া যায়নি', mr: 'गणना सापडली नाही'
  },
  'inv.closeArchive': {
    en: 'Close Archive', hi: 'संग्रह बंद करें', te: 'ఆర్కైవ్ మూసివేయండి', ta: 'காப்பகத்தை மூடு', bn: 'আর্কাইভ বন্ধ', mr: 'संग्रह बंद करा'
  },

  // ─── PROFILE PAGE ───
  'prof.title': {
    en: 'Profile Settings', hi: 'प्रोफ़ाइल सेटिंग', te: 'ప్రొఫైల్ సెట్టింగ్‌లు', ta: 'சுயவிவர அமைப்புகள்', bn: 'প্রোফাইল সেটিংস', mr: 'प्रोफाइल सेटिंग'
  },
  'prof.update': {
    en: 'Update your personal information', hi: 'अपनी जानकारी बदलें', te: 'మీ సమాచారం మార్చండి', ta: 'உங்கள் தகவலை புதுப்பிக்கவும்', bn: 'আপনার তথ্য পরিবর্তন করুন', mr: 'तुमची माहिती बदला'
  },
  'prof.name': {
    en: 'Full Name', hi: 'पूरा नाम', te: 'పూర్తి పేరు', ta: 'முழு பெயர்', bn: 'পুরো নাম', mr: 'पूर्ण नाव'
  },
  'prof.phone': {
    en: 'Phone Number', hi: 'फ़ोन नंबर', te: 'ఫోన్ నంబర్', ta: 'தொலைபேசி எண்', bn: 'ফোন নম্বর', mr: 'फोन नंबर'
  },
  'prof.location': {
    en: 'Location', hi: 'जगह', te: 'ప్రదేశం', ta: 'இடம்', bn: 'অবস্থান', mr: 'ठिकाण'
  },
  'prof.email': {
    en: 'Email', hi: 'ईमेल', te: 'ఈమెయిల్', ta: 'மின்னஞ்சல்', bn: 'ইমেইল', mr: 'ईमेल'
  },
  'prof.member': {
    en: 'Member since', hi: 'सदस्य तिथि', te: 'సభ్యత నుండి', ta: 'உறுப்பினர் முதல்', bn: 'সদস্য তারিখ', mr: 'सदस्य तारीख'
  },
  'prof.saveChanges': {
    en: 'Save Changes', hi: 'बदलाव सेव करें', te: 'మార్పులు సేవ్ చేయండి', ta: 'மாற்றங்களை சேமிக்கவும்', bn: 'পরিবর্তন সংরক্ষণ', mr: 'बदल जतन करा'
  },
  'prof.saving': {
    en: 'Saving...', hi: 'सेव हो रहा है...', te: 'సేవ్ అవుతోంది...', ta: 'சேமிக்கிறது...', bn: 'সংরক্ষণ হচ্ছে...', mr: 'जतन होत आहे...'
  },
  'prof.signout': {
    en: 'Sign Out', hi: 'लॉग आउट', te: 'సైన్ అవుట్', ta: 'வெளியேறு', bn: 'সাইন আউট', mr: 'साइन आउट'
  },
  'prof.signoutMsg': {
    en: "You'll be taken back to the login page.", hi: 'आप लॉगिन पेज पर जाएंगे।', te: 'మీరు లాగిన్ పేజీకి వెళ్ళబోతున్నారు.', ta: 'உள்நுழைவு பக்கத்திற்கு திரும்புவீர்கள்.', bn: 'আপনি লগইন পেজে ফিরে যাবেন।', mr: 'तुम्ही लॉगिन पेजवर जाल.'
  },
  'prof.cropsTracked': {
    en: 'Crops Tracked', hi: 'ट्रैक की गई फसलें', te: 'ట్రాక్ చేసిన పంటలు', ta: 'கண்காணிக்கப்பட்ட பயிர்கள்', bn: 'ট্র্যাক করা ফসল', mr: 'ट्रॅक केलेली पिके'
  },
  'prof.portfolioHealth': {
    en: 'Portfolio Health', hi: 'फसल स्वास्थ्य', te: 'పంట ఆరోగ్యం', ta: 'பயிர் ஆரோக்கியம்', bn: 'ফসল স্বাস্থ্য', mr: 'पीक आरोग्य'
  },
  'prof.recentCrops': {
    en: 'Recent Crops', hi: 'हालिया फसलें', te: 'ఇటీవలి పంటలు', ta: 'சமீபத்திய பயிர்கள்', bn: 'সাম্প্রতিক ফসল', mr: 'अलीकडील पिके'
  },
  'prof.viewAll': {
    en: 'View all', hi: 'सारी देखें', te: 'అన్నీ చూడండి', ta: 'அனைத்தையும் காண', bn: 'সব দেখুন', mr: 'सर्व बघा'
  },
  'prof.accountActive': {
    en: 'Account Active', hi: 'खाता सक्रिय', te: 'ఖాతా యాక్టివ్', ta: 'கணக்கு செயலில்', bn: 'অ্যাকাউন্ট সক্রিয়', mr: 'खाते सक्रिय'
  },
  'prof.back': {
    en: 'Back to Dashboard', hi: 'मुख्य पेज पर वापस', te: 'డాష్‌బోర్డ్‌కి తిరిగి', ta: 'முகப்புக்கு திரும்பு', bn: 'ড্যাশবোর্ডে ফিরে যান', mr: 'मुख्यपृष्ठावर परत'
  },
  'prof.language': {
    en: 'App Language', hi: 'भाषा', te: 'యాప్ భాష', ta: 'செயலி மொழி', bn: 'অ্যাপ ভাষা', mr: 'अॅप भाषा'
  },
  'prof.langDesc': {
    en: 'Choose your preferred language', hi: 'अपनी भाषा चुनें', te: 'మీ భాషను ఎంచుకోండి', ta: 'உங்கள் மொழியைத் தேர்ந்தெடுக்கவும்', bn: 'আপনার ভাষা নির্বাচন করুন', mr: 'तुमची भाषा निवडा'
  },

  // ─── CROP PICKER ───
  'cp.title': {
    en: 'Smart Crop Picker', hi: 'स्मार्ट फसल चयन', te: 'స్మార్ట్ పంట ఎంపిక', ta: 'ஸ்மார்ட் பயிர் தேர்வு', bn: 'স্মার্ট ফসল নির্বাচন', mr: 'स्मार्ट पीक निवड'
  },
  'cp.findBest': {
    en: 'Find the best crop for your soil', hi: 'अपनी मिट्टी के लिए सबसे अच्छी फसल खोजें', te: 'మీ నేలకు అత్యంత సరిపోయే పంటను కనుగొనండి', ta: 'உங்கள் மண்ணிற்கு ஏற்ற பயிரைக் கண்டறியவும்', bn: 'আপনার মাটির জন্য সেরা ফসল খুঁজুন', mr: 'तुमच्या जमिनीसाठी सर्वोत्तम पीक शोधा'
  },

  // ─── PROFIT CALCULATOR ───
  'pc.title': {
    en: 'Profit Calculator', hi: 'मुनाफा कैलकुलेटर', te: 'లాభ కాలిక్యులేటర్', ta: 'லாப கணிப்பான்', bn: 'লাভ ক্যালকুলেটর', mr: 'नफा कॅल्क्युलेटर'
  },
  'pc.calculate': {
    en: 'Calculate Profit', hi: 'मुनाफा निकालें', te: 'లాభం లెక్కించండి', ta: 'லாபம் கணக்கிடு', bn: 'লাভ হিসাব করুন', mr: 'नफा काढा'
  },
  'pc.save': {
    en: 'Save to Profile', hi: 'सेव करें', te: 'సేవ్ చేయండి', ta: 'சேமிக்கவும்', bn: 'সংরক্ষণ করুন', mr: 'जतन करा'
  },
  'pc.download': {
    en: 'Download Summary', hi: 'रिपोर्ट डाउनलोड', te: 'నివేదిక డౌన్‌లోడ్', ta: 'அறிக்கை பதிவிறக்கம்', bn: 'রিপোর্ট ডাউনলোড', mr: 'अहवाल डाउनलोड'
  },
  'pc.history': {
    en: 'History', hi: 'इतिहास', te: 'చరిత్ర', ta: 'வரலாறு', bn: 'ইতিহাস', mr: 'इतिहास'
  },

  // ─── COMMON ───
  'common.loading': {
    en: 'Loading...', hi: 'लोड हो रहा है...', te: 'లోడ్ అవుతోంది...', ta: 'ஏற்றுகிறது...', bn: 'লোড হচ্ছে...', mr: 'लोड होत आहे...'
  },
  'common.save': {
    en: 'Save', hi: 'सेव करें', te: 'సేవ్', ta: 'சேமி', bn: 'সংরক্ষণ', mr: 'जतन करा'
  },
  'common.cancel': {
    en: 'Cancel', hi: 'रद्द करें', te: 'రద్దు', ta: 'ரத்து செய்', bn: 'বাতিল', mr: 'रद्द करा'
  },
  'common.delete': {
    en: 'Delete', hi: 'मिटाएं', te: 'తొలగించు', ta: 'நீக்கு', bn: 'মুছুন', mr: 'हटवा'
  },
  'common.back': {
    en: 'Back', hi: 'वापस', te: 'వెనుకకు', ta: 'பின்', bn: 'ফিরে', mr: 'मागे'
  },
  'common.edit': {
    en: 'Edit', hi: 'बदलें', te: 'మార్చు', ta: 'திருத்து', bn: 'সম্পাদনা', mr: 'बदला'
  },
  'common.close': {
    en: 'Close', hi: 'बंद करें', te: 'మూసివేయండి', ta: 'மூடு', bn: 'বন্ধ করুন', mr: 'बंद करा'
  },
  'common.search': {
    en: 'Search', hi: 'खोजें', te: 'వెతకండి', ta: 'தேடு', bn: 'অনুসন্ধান', mr: 'शोधा'
  },
  'common.yes': {
    en: 'Yes', hi: 'हाँ', te: 'అవును', ta: 'ஆம்', bn: 'হ্যাঁ', mr: 'होय'
  },
  'common.no': {
    en: 'No', hi: 'नहीं', te: 'కాదు', ta: 'இல்லை', bn: 'না', mr: 'नाही'
  },
  'common.success': {
    en: 'Success!', hi: 'सफल!', te: 'విజయం!', ta: 'வெற்றி!', bn: 'সফল!', mr: 'यशस्वी!'
  },
  'common.error': {
    en: 'Something went wrong', hi: 'कुछ गलत हुआ', te: 'ఏదో తప్పు జరిగింది', ta: 'ஏதோ தவறு நிகழ்ந்தது', bn: 'কিছু ভুল হয়েছে', mr: 'काहीतरी चूक झाली'
  },
  'common.noData': {
    en: 'No data available', hi: 'कोई जानकारी नहीं', te: 'డేటా అందుబాటులో లేదు', ta: 'தரவு இல்லை', bn: 'কোনো তথ্য নেই', mr: 'माहिती उपलब्ध नाही'
  },
  'common.high': {
    en: 'High', hi: 'ज्यादा', te: 'ఎక్కువ', ta: 'அதிம', bn: 'বেশি', mr: 'जास्त'
  },
  'common.moderate': {
    en: 'Moderate', hi: 'मध्यम', te: 'మధ్యస్థం', ta: 'மிதமான', bn: 'মাঝারি', mr: 'मध्यम'
  },
  'common.low': {
    en: 'Low', hi: 'कम', te: 'తక్కువ', ta: 'குறைவு', bn: 'কম', mr: 'कमी'
  },
  'common.critical': {
    en: 'Danger', hi: 'खतरा/गंभीर', te: 'ప్రమాదం', ta: 'ఆపத்து', bn: 'বিপদ', mr: 'धोका'
  },
  'common.retry': {
    en: 'Try Again', hi: 'दोबारा प्रयास करें', te: 'మళ్లీ ప్రయత్నించండి', ta: 'மீண்டும் முயற்சிக்கவும்', bn: 'আবার চেষ্টা করুন', mr: 'पुन्हा प्रयत्न करा'
  },
  'det.solution': {
    en: 'Treatment Steps', hi: 'समाधान के कदम', te: 'చికిత్స దశలు', ta: 'சிகிச்சை முறைகள்', bn: 'সমাধানের ধাপ', mr: 'उपचार पायऱ्या'
  },
  'det.prevention': {
    en: 'Prevention Guide', hi: 'बचाव गाइड', te: 'నివారణ గైడ్', ta: 'தடுப்பு வழிகாட்டி', bn: 'প্রতিরোধ নির্দেশিকা', mr: 'प्रतिबंध मार्गदर्शक'
  },
  'schemes.title': {
    en: 'Sarkari Schemes', hi: 'सरकारी योजनाएं', te: 'ప్రభుత్వ పథకాలు', ta: 'அரசு திட்டங்கள்', bn: 'সরকারি প্রকল্প', mr: 'सरकारी योजना'
  },
  'schemes.subtitle': {
    en: 'Government benefits for farmers', hi: 'किसानों के लिए सरकारी लाभ', te: 'రైతులకు ప్రభుత్వ ప్రయోజనాలు', ta: 'விவசாயிகளுக்கான அரசு சலுகைகள்', bn: 'কৃষকদের জন্য সরকারি সুবিধা', mr: 'शेतकऱ्यांसाठी सरकारी लाभ'
  },
  'schemes.search': {
    en: 'Search schemes...', hi: 'योजना खोजें...', te: 'పథకాలు వెతకండి...', ta: 'திட்டங்களைத் தேடு...', bn: 'প্রকল্প খুঁজুন...', mr: 'योजना शोधा...'
  },
  'schemes.applyNow': {
    en: 'Open Website', hi: 'वेबसाइट खोलें', te: 'వెబ్‌సైట్ తెరవండి', ta: 'இணையதளத்தைத் திறக்கவும்', bn: 'ওয়েবসাইট খুলুন', mr: 'वेबसाइट उघडा'
  },
  'schemes.back': {
    en: 'Back to List', hi: 'सूची पर वापस', te: 'జాబితాకు తిరిగి', ta: 'பட்டியலுக்குத் திரும்பு', bn: 'তালিকায় ফিরে যান', mr: 'यादीकडे मागे'
  },
  'schemes.who': {
    en: 'Who can apply?', hi: 'कौन आवेदन कर सकता है?', te: 'ఎవరు దరఖాస్తు చేసుకోవచ్చు?', ta: 'யார் விண்ணப்பிக்கலாம்?', bn: 'কে আবেদন করতে পারে?', mr: 'कोण अर्ज करू शकतो?'
  },
  'schemes.aid': {
    en: 'Financial Aid', hi: 'आर्थिक सहायता', te: 'ఆర్థిక సహాయం', ta: 'நிதியுதवि', bn: 'আর্থিক সাহায্য', mr: 'आर्थिक मदत'
  },
  'schemes.loading': {
    en: 'Finding schemes...', hi: 'योजनाएं खोज रहे हैं...', te: 'పథకాలను కనుగొంటోంది...', ta: 'திட்டங்களைக் கண்டறிதல்...', bn: 'প্রকল্প খুঁজছি...', mr: 'योजना शोधत आहे...'
  },
  'footer.sub': {
    en: 'Grow Smarter. Cultivate Better.', hi: 'होशियार बनें। बेहतर खेती करें।', te: 'తెలివిగా ఎదగండి. మెరుగ్గా సాగు చేయండి.', ta: 'புத்திசாலித்தனமாக வளருங்கள். சிறப்பாக பயிரிடுங்கள்.', bn: 'স্মার্ট ভাবে বেড়ে উঠুন। আরও ভালো চাষ করুন।', mr: 'हुशार व्हा. उत्तम शेती करा.'
  },
  'footer.desc': {
    en: 'AI-powered farming assistant built for Indian farmers. Detect crop diseases, track markets, and grow with confidence.', hi: 'भारतीय किसानों के लिए बनाया गया AI सहायक। फसल रोगों का पता लगाएं, मंडियों पर नज़र रखें और आत्मविश्वास के साथ आगे बढ़ें।', te: 'భారతీయ రైతుల కోసం రూపొందించబడిన AI సహాయకుడు. పంట వ్యాధులను గుర్తించండి, మార్కెట్‌లను ట్రాక్ చేయండి మరియు నమ్మకంతో ఎదగండి.', ta: 'இந்திய விவசாயிகளுக்காக உருவாக்கப்பட்ட AI உதவியாளர். பயிர் நோய்களைக் கண்டறியவும், சந்தைகளைக் கண்காணிக்கவும் மற்றும் நம்பிக்கையுடன் வளரவும்.', bn: 'ভারতীয় কৃষকদের জন্য তৈরি AI সহকারী। ফসলের রোগ শনাক্ত করুন, বাজার ট্র্যাক করুন এবং আত্মবিশ্বাসের সাথে বেড়ে উঠুন।', mr: 'भारतीय शेतकऱ्यांसाठी बनवलेला AI सहाय्यक. पिकांवरील रोग ओळखा, बाजारभावावर लक्ष ठेवा आणि आत्मविश्वासाने प्रगती करा.'
  },
  'footer.quickLinks': {
    en: 'Quick Links', hi: 'त्वरित लिंक', te: 'త్వరిత లింకులు', ta: 'விரைவு இணைப்புகள்', bn: 'দ্রুত লিঙ্ক', mr: 'महत्वाच्या लिंक्स'
  },
  'footer.company': {
    en: 'Company', hi: 'कंपनी', te: 'కంపెనీ', ta: 'நிறுவனம்', bn: 'কোম্পানি', mr: 'कंपनी'
  },
  'footer.contact': {
    en: 'Contact', hi: 'संपर्क', te: 'సంప్రదించండి', ta: 'தொடர்பு', bn: 'যোগাযোগ', mr: 'संपर्क'
  },
  'footer.rights': {
    en: 'All rights reserved.', hi: 'सर्वाधिकार सुरक्षित।', te: 'అన్ని హక్కులు ప్రత్యేకించబడ్డాయి.', ta: 'அனைத்து உரிமைகளும் பாதுகாக்கப்பட்டவை.', bn: 'সমস্ত অধিকার সংরক্ষিত।', mr: 'सर्व हक्क राखीव.'
  },
  'footer.madeWithLove': {
    en: 'Made with love for Indian Farmers', hi: 'भारतीय किसानों के लिए प्यार से बनाया गया', te: 'భారతీయ రైతుల కోసం ప్రేమతో రూపొందించబడింది', ta: 'இந்திய விவசாயிகளுக்காக அன்புடன் உருவாக்கப்பட்டது', bn: 'ভারতীয় কৃষকদের জন্য ভালোবাসা দিয়ে তৈরি', mr: 'भारतीय शेतकऱ्यांसाठी प्रेमाने बनवलेले'
  },
  'footer.craftedBy': {
    en: 'Crafted with passion by Syntax Squad', hi: 'सिंटैक्स स्क्वाड द्वारा जुनून के साथ बनाया गया', te: 'సింటాక్స్ స్క్వాడ్ ద్వారా అభిరుచితో రూపొందించబడింది', ta: 'சின்டாக்స్ ஸ்குవాட் ஆர்வத்துடன் உருவாக்கியது', bn: 'সিনট্যাক্স স্কোয়াড আবেগ দিয়ে তৈরি করেছে', mr: 'सिंटॅक्स स्क्वाडने आवडीने बनवलेले'
  },
  'common.home': {
    en: 'Home', hi: 'मुख्य पृष्ठ', te: 'హోమ్', ta: 'முகப்பு', bn: 'হোম', mr: 'होम'
  },
  'privacy.title': {
    en: 'Privacy Policy', hi: 'गोपनीयता नीति', te: 'गोप्यతా నివారణ', ta: 'தனியுரிமைக் கொள்கை', bn: 'গোপনীয়তা নীতি', mr: 'गोपनीयता धोरण'
  },
  'terms.title': {
    en: 'Terms of Service', hi: 'सेवा की शर्तें', te: 'సేవా నిబంధనలు', ta: 'சேவை விதிமுறைகள்', bn: 'পরিষেবার শর্তাবলী', mr: 'सेवा अटी'
  },
  'team.title': {
    en: 'Meet the Team', hi: 'हमारी टीम से मिलें', te: 'మా బృందాన్ని కలవండి', ta: 'குழுவைச் சந்திக்கவும்', bn: 'টিমের সাথে দেখা করুন', mr: 'आमच्या टीमला भेटा'
  },
  'team.minds': {
    en: 'The Minds Behind', hi: 'इसके पीछे के दिमाग', te: 'దీని వెనుక ఉన్న మేధావులు', ta: 'இதன் பின்னால் ఉన్న மூளைகள்', bn: 'এর পেছনের কারিগররা', mr: 'यामागचे मेंदू'
  },
  'contact.title': {
    en: 'Contact Us', hi: 'संपर्क करें', te: 'మమ్మల్ని సంప్రదించండి', ta: 'எங்களைத் தொடர்பு கொள்ளவும்', bn: 'আমাদের সাথে যোগাযোগ করুন', mr: 'आमच्याशी संपर्क साधा'
  },
  'common.goBack': {
    en: 'Go Back', hi: 'वापस जाएं', te: 'వెనుకకు', ta: 'பின் செல்', bn: 'ফিরে যান', mr: 'मागे जा'
  },
  'common.signin': {
    en: 'Sign In', hi: 'लॉग इन करें', te: 'సైన్ ఇన్', ta: 'உள்நுழையவும்', bn: 'সাইন ইন', mr: 'साइन इन'
  },
};

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    try {
      return localStorage.getItem('krishiai_language') || 'en';
    } catch {
      return 'en';
    }
  });

  // Persist language choice
  useEffect(() => {
    try {
      localStorage.setItem('krishiai_language', language);
    } catch (e) {
      console.warn('Could not save language preference:', e);
    }
  }, [language]);

  // Translation function — returns English as safe fallback
  const t = (key) => {
    try {
      const entry = translations[key];
      if (!entry) return key; // fallback: return the key itself
      return entry[language] || entry['en'] || key;
    } catch {
      return key;
    }
  };

  const value = {
    language,
    setLanguage,
    t,
    languages: LANGUAGES,
    currentLanguage: LANGUAGES.find(l => l.code === language) || LANGUAGES[0],
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    // Safe fallback if used outside provider (prevents crash)
    return {
      language: 'en',
      setLanguage: () => { },
      t: (key) => key,
      languages: LANGUAGES,
      currentLanguage: LANGUAGES[0],
    };
  }
  return ctx;
};

export { LANGUAGES };
export default LanguageContext;
