import { InfiniteScroll } from './infinteScroll.js';
const PubliveInfinteElem = document.getElementById('PubliveInfinteElem');
let enableInfinteArticles = PubliveInfinteElem.dataset.enableInfinteArticles; // true or false
let responseApiUrl = PubliveInfinteElem.dataset.responseApiUrl; // url of the response api
let currentPostSlug = PubliveInfinteElem.dataset.currentPostSlug; // slug of the current post
let websiteDomain = PubliveInfinteElem.dataset.websiteDomain || `https://${window.location.hostname}`; // website domain
let postId = PubliveInfinteElem.dataset.postId; // post id
let articlekeyString = article_url_string() // key string of the current post
let absoluteUrl = websiteDomain + currentPostSlug // absolute url of the current post
let nextArticleContainer = PubliveInfinteElem.dataset.nextArticleContainer; // selector of the next article container
let appendContainer = PubliveInfinteElem.dataset.appendContainer; // selector of the append container
let infScrollArticleURLs = []; // array of article urls
let infScrollPageIndex = 2 
function check_duplicate(nextURL){
  var current_page_path = window.location.pathname.replace(/^.*\/\/[^\/]+/, '')
  if (current_page_path === nextURL){
    return 1
  }
  return 0
}
function updateNextURL( page ) {
  nextURL = infScrollArticleURLs[page]
}

function getCookieValue(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
  return null;
}

function article_url_string() {
  var url = window.location.pathname.replace(/^.*\/\/[^\/]+/, '')
  url = url.replaceAll("/","")
    return url
}

function article_url_string_for_title(url) {
  url = decodeURIComponent(url)
  const slugify = str =>
  str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
  url = slugify(url)
  return url
}

function getAllValues() {
  var inputValues = $('.category_list input').map(function() {
      return {"name":$(this).data('name'),"slug":$(this).val()}
  })
  return inputValues;
}



function getPenPath() {  
  if (this.loadCount == 0){
    this.loadCount = 1
  }
  if ( category_list[ this.loadCount ] ) {
    return `${websiteDomain}/get_category_posts/${category_list[ this.loadCount ].slug}`;
  }
  else{
    return 0
  }
}
// Check if window.visited_pages is not defined or is not an array
if (!window.visited_pages || !Array.isArray(window.visited_pages)) {
  window.visited_pages = []; // Initialize it as an empty array
}

window.visited_pages.push(article_url_string_for_title(absoluteUrl))
function get_me_the_visited_page(){
  return window.visited_pages
}

function isInCertainHeight(element) {
  var rect = element.getBoundingClientRect();
  if (!rect) return false;
  var elementTop = rect.top + window.pageYOffset;
  var elementBottom = elementTop + element.offsetHeight;
  var viewportTop = window.pageYOffset + 400;
  var viewportBottom = viewportTop + window.innerHeight - 800;
  var viewportBottom_new = viewportTop + window.innerHeight - 200;
  return (viewportTop < elementTop && elementTop < viewportBottom) || (viewportTop < elementBottom && elementBottom < viewportBottom_new) || (elementBottom > viewportTop && elementTop < viewportBottom);
}

function infinite_articles(){
  let elem = ''
  
  elem = document.querySelector(nextArticleContainer);
  let infScrollArticle = new InfiniteScroll( elem, {
    // options
    path: function() {
      if(nextURL){
        return `${websiteDomain}${nextURL}`;
      }
      return ''
    },
    append: appendContainer,
    prefill: true,
    debug: false, // for prod set this as false
    history: false,
    historyTitle: false,
    scrollThreshold: 1500,
    // checkLastPage: getPenPath
  });
  
  

  infScrollArticle.on( 'load', function( body, path, response ) {
    window.loaded_article_url = websiteDomain + nextURL
    try{
      const elements = body.getElementsByClassName('next_page_hide');
      for (let i = 0; i < elements.length; i++) {
        elements[i].style.display = 'none';
      }
      }
      catch(err){}
    var all_next_divs = body.querySelectorAll('.next_page_show_ads')
    try {
      window.page_counter++;
      for(let i = 0; i<all_next_divs.length;i++){
        const element_id = all_next_divs[i].id.slice(0, -1) // slice last digit from the id to update it
        all_next_divs[i].id = element_id+window.page_counter;
      }
    }

    catch(err) {
      console.log("error is ",err)
    }
    try{
      const hide_ads_cookie_value = getCookieValue("hide_ads");
      if (hide_ads_cookie_value == "1") {
          const divs = body.getElementsByClassName("ads-container");
          for (let i = divs.length - 1; i >= 0; i--) {
            const div = divs[i];
            if (div && div.parentNode) {
              const parent = div?.parentNode
              parent.removeChild(div);
              try{
                const siblings = Array.from(parent?.children).filter(child => child !== div);
  
                // Check if siblings are less than 2
                if (siblings?.length < 2 && parent) {
                  // Update height to auto
                  parent.style.height = 'auto';
                }
              }catch(err){
                console.log('error',err)
              }

            }
          }
      }
    }
    catch(err){
      console.log("hide ads error");
    }
    try{
      window.visited_pages.push(article_url_string_for_title(path))
      // lazy loading all the image for infinite article
      const article_image = body.querySelectorAll('img')
      for(let i=0 ;i<=article_image.length;i++){
        article_image[i]?.setAttribute('loading', 'lazy');
      }
    }
    catch(err){
      console.error("image article break =>",err)
    }
    
    // Convert jQuery to vanilla JS
    const pulseContainer = document.querySelector('.pulse-container');
    if (pulseContainer) {
      pulseContainer.style.display = 'none';
    }

    const readMoreBox = document.querySelector('.read-more-article-box');
    if (readMoreBox) {
      readMoreBox.style.display = 'flex';
    }
    
    updateNextURL(infScrollArticle.pageIndex)
    infScrollPageIndex = infScrollArticle.pageIndex
  });

  infScrollArticle.on( 'request', function( path, fetchPromise ) {
    // Convert jQuery to vanilla JS
    const pulseContainer = document.querySelector('.pulse-container');
    if (pulseContainer) {
      pulseContainer.style.display = 'flex';
    }
    
    const infiniteLoader = document.querySelector('div #infinite_page_loader');
    if (infiniteLoader) {
      infiniteLoader.style.display = 'flex';
    }
  })
  
  infScrollArticle.on( 'last', function( body, path ) {
    // Convert jQuery to vanilla JS
    const infiniteLoader = document.querySelector('div #infinite_page_loader');
    if (infiniteLoader) {
      infiniteLoader.style.display = 'none';
    }
  }); 
  
}


function article_url_string() {
  var url = window.location.pathname.replace(/^.*\/\/[^\/]+/, '')
  url = url.replaceAll("/","")
    return url
}


const get_infinite_articles = (responseApiUrl) => {
  if(!responseApiUrl.includes("https://")){
    responseApiUrl = `https://${responseApiUrl}`
  }
  fetch(`${responseApiUrl}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    }
  })
  .then(response => {
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  })
  .then(res => {
    try {
      const post_items = res.pages;
      
      if (!post_items || !Array.isArray(post_items)) {
        throw new Error('Invalid response format: pages array not found');
      }
      
      if (post_items.length > 0) {
        // Show related articles section
        const relatedShowElement = document.querySelector(".related_show");
        if (relatedShowElement) {
          relatedShowElement.style.display = 'block';
        }
        
        // Show divider
        const dividerElement = document.getElementById('realted_articles_divider');
        if (dividerElement) {
          dividerElement.style.display = 'block';
        }
        
        for (let i = 0; i < post_items.length; i++) {
          if (check_duplicate(post_items[i].url)) {
            continue;
          }
          infScrollArticleURLs.push(post_items[i].url);
        }
        
        const page = 0;
        nextURL = infScrollArticleURLs[page];
        infinite_articles();
      } else {
        console.warn("No post items found in response");
      }
    } catch (error) {
      console.error("Error processing response:", error);
      showErrorMessage("Unable to process articles data");
    }
  })
  .catch(error => {
    console.error("Error fetching infinite articles:", error);
    showErrorMessage("Unable to load more articles. Please try again later.");
  });
};

// Helper function to show error messages
function showErrorMessage(message) {
  try {
    const errorMessage = document.createElement('div');
    errorMessage.className = 'error-message';
    errorMessage.textContent = message;
    errorMessage.style.cssText = 'color: #ff0000; text-align: center; padding: 20px; background-color: #ffe6e6; border: 1px solid #ff9999; border-radius: 4px; margin: 10px 0;';
    
    const leftCol = document.querySelector('#left-col');
    if (leftCol) {
      // Remove any existing error messages
      const existingError = leftCol.querySelector('.error-message');
      if (existingError) {
        existingError.remove();
      }
      leftCol.appendChild(errorMessage);
    }
  } catch (err) {
    console.error("Error displaying error message:", err);
  }
}



window.addEventListener('resize', function() {
  try{
    if(typeof window.adjust_padding == 'function'){window.adjust_padding()}
    url = article_url_string()
    const new_page = get_me_the_visited_page() // this function is to update the visited page
    for(let i=0;i<window.visited_pages.length;i++){
      if(isInCertainHeight(document.querySelector('.article_scroll_post_'+window.visited_pages[i]))){
        const title = document.querySelector('.article_scroll_post_'+window.visited_pages[i]).getAttribute('data-page-title')
        if(document.querySelector('title').textContent !== title){
          document.querySelector('title').textContent = title;
          const state = { title: title };
          const url = document.querySelector('.article_scroll_post_'+window.visited_pages[i]).getAttribute('data-page-url')
          history.pushState(state, title, `${websiteDomain}${url}`);
        }
      }
    }
  }catch(err){
    console.log('error',err);
  }
});

if(enableInfinteArticles){
  get_infinite_articles(responseApiUrl)
}