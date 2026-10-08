// Comprehensive English stopwords list
const STOP_WORDS = new Set([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'aren\'t', 'as', 'at',
  'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by', 'can', 'can\'t', 'cannot',
  'could', 'couldn\'t', 'did', 'didn\'t', 'do', 'does', 'doesn\'t', 'doing', 'don\'t', 'down', 'during', 'each',
  'few', 'for', 'from', 'further', 'had', 'hadn\'t', 'has', 'hasn\'t', 'have', 'haven\'t', 'having', 'he', 'he\'d',
  'he\'ll', 'he\'s', 'her', 'here', 'here\'s', 'hers', 'herself', 'him', 'himself', 'his', 'how', 'how\'s', 'i',
  'i\'d', 'i\'ll', 'i\'m', 'i\'ve', 'if', 'in', 'into', 'is', 'isn\'t', 'it', 'it\'s', 'its', 'itself', 'let\'s',
  'me', 'more', 'most', 'mustn\'t', 'my', 'myself', 'no', 'nor', 'not', 'of', 'off', 'on', 'once', 'only', 'or',
  'other', 'ought', 'our', 'ours', 'ourselves', 'out', 'over', 'own', 'same', 'shan\'t', 'she', 'she\'d', 'she\'ll',
  'she\'s', 'should', 'shouldn\'t', 'so', 'some', 'such', 'than', 'that', 'that\'s', 'the', 'their', 'theirs',
  'them', 'themselves', 'then', 'there', 'there\'s', 'these', 'they', 'they\'d', 'they\'ll', 'they\'re', 'they\'ve',
  'this', 'those', 'through', 'to', 'too', 'under', 'until', 'up', 'very', 'was', 'wasn\'t', 'we', 'we\'d', 'we\'ll',
  'we\'re', 'we\'ve', 'were', 'weren\'t', 'what', 'what\'s', 'when', 'when\'s', 'where', 'where\'s', 'which', 'while',
  'who', 'who\'s', 'whom', 'why', 'why\'s', 'with', 'won\'t', 'would', 'wouldn\'t', 'you', 'you\'d', 'you\'ll',
  'you\'re', 'you\'ve', 'your', 'yours', 'yourself', 'yourselves', 'will', 'also', 'etc', 'including', 'using',
  'well', 'work', 'working', 'good', 'strong', 'ability', 'looking', 'role', 'intern', 'internship', 'opportunity'
]);

/**
 * Tokenize and preprocess text into clean keyword tokens
 */
export const tokenize = (text) => {
  if (!text || typeof text !== 'string') return [];
  
  // Normalize and replace punctuation with spaces, keeping alphanumeric and tech chars (+, #, .)
  const cleaned = text
    .toLowerCase()
    .replace(/[^\w\s+#.-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const tokens = cleaned.split(' ')
    .map(t => t.trim())
    .filter(t => t.length > 1 && !STOP_WORDS.has(t));

  return tokens;
};

/**
 * Compute Term Frequency (TF) for a document
 */
export const computeTF = (tokens) => {
  const tf = {};
  if (!tokens.length) return tf;

  tokens.forEach(token => {
    tf[token] = (tf[token] || 0) + 1;
  });

  const totalTokens = tokens.length;
  Object.keys(tf).forEach(token => {
    tf[token] = tf[token] / totalTokens;
  });

  return tf;
};

/**
 * Compute Inverse Document Frequency (IDF) given a corpus of documents (token arrays)
 */
export const computeIDF = (corpusDocs) => {
  const idf = {};
  const N = corpusDocs.length || 1;

  // Count document frequency for each term
  corpusDocs.forEach(tokens => {
    const uniqueTokens = new Set(tokens);
    uniqueTokens.forEach(token => {
      idf[token] = (idf[token] || 0) + 1;
    });
  });

  // Calculate log(N / df) with smoothing
  Object.keys(idf).forEach(token => {
    idf[token] = Math.log((N + 1) / (idf[token] + 1)) + 1;
  });

  return idf;
};

/**
 * Vectorize document using TF and global IDF
 */
export const computeTFIDFVector = (tokens, idfDict) => {
  const tf = computeTF(tokens);
  const vector = {};

  Object.keys(tf).forEach(term => {
    const idf = idfDict[term] || Math.log(2); // fallback IDF
    vector[term] = tf[term] * idf;
  });

  return vector;
};

/**
 * Compute Cosine Similarity between two sparse TF-IDF vectors
 * Returns value between 0.0 and 1.0
 */
export const computeCosineSimilarity = (vecA, vecB) => {
  if (!vecA || !vecB) return 0;

  const terms = new Set([...Object.keys(vecA), ...Object.keys(vecB)]);
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  terms.forEach(term => {
    const valA = vecA[term] || 0;
    const valB = vecB[term] || 0;
    dotProduct += valA * valB;
    normA += valA * valA;
    normB += valB * valB;
  });

  if (normA === 0 || normB === 0) return 0;

  const similarity = dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  return Math.max(0, Math.min(1, similarity));
};
