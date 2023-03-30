import { PixabayAPI } from './js/PixabayAPI';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const divEl = document.querySelector('.gallery');
const formEl = document.querySelector('#search-form');
const loadMoreBtn = document.querySelector('.load-more');

let page = 1;
let query = '';

const reset = () => {
  divEl.innerHTML = '';
};

let gallery = new SimpleLightbox('.gallery a', {
  captionsData: 'alt',
  captionDelay: 250,
});

const searchPhoto = evt => {
  evt.preventDefault();
  query = formEl.searchQuery.value;
  if (!query) {
    reset();
    loadMoreBtn.classList.add('is-hidden');
    return;
  }
  PixabayAPI(query).then(data => {
    if (data.hits.length === 0) {
      Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );
      reset();
      return;
    } else if (data.totalHits > 40) {
      loadMoreBtn.classList.remove('is-hidden');
    }
    page = 1;
    Notify.success(`Hooray! We found ${data.totalHits} images.`);
    divEl.innerHTML = photoMarkup(data.hits);
    gallery.refresh();
  });
};

const onClickLoadBtn = () => {
  page += 1;
  PixabayAPI(query, page).then(data => {
    divEl.insertAdjacentHTML('beforeend', photoMarkup(data.hits));
    gallery.refresh();
    if (page >= Math.ceil(data.totalHits / 40)) {
      page = 1;
      loadMoreBtn.classList.add('is-hidden');
      Notify.warning(
        "We're sorry, but you've reached the end of search results."
      );
    }
  });
};

function photoMarkup(arr) {
  return arr
    .map(
      ({
        webformatURL,
        largeImageURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      }) =>
        `<div class="photo-card" >
            <a href=${largeImageURL}><img src="${webformatURL}" alt="${tags}" loading="lazy" /></a>
            <div class="info">
            <p class="info-item">
                <b>Likes:
                ${likes}</b>
            </p>
            <p class="info-item">
                <b>Views:
                ${views}</b>
            </p>
            <p class="info-item">
                <b>Comments:
                ${comments}</b>
            </p>
            <p class="info-item">
                <b>Downloads:
                ${downloads}</b>
            </p>
            </div>
      </div>`
    )
    .join('');
}

formEl.addEventListener('submit', searchPhoto);
loadMoreBtn.addEventListener('click', onClickLoadBtn);